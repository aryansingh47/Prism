<?php
declare(strict_types=1);
// Prism Travels PHP API. Keep secrets in ../prism-private/config.php, OUTSIDE public_html.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');

function fail(int $status, string $message, string $code = 'REQUEST_FAILED'): never {
    http_response_code($status);
    echo json_encode(['ok'=>false, 'code'=>$code, 'message'=>$message], JSON_UNESCAPED_SLASHES);
    exit;
}
function okay(array $payload = []): never {
    http_response_code(200);
    echo json_encode(['ok'=>true] + $payload, JSON_UNESCAPED_SLASHES);
    exit;
}

$configFile = dirname(__DIR__, 2) . '/prism-private/config.php';
if (!is_file($configFile)) {
    fail(503, 'The enquiry and account service is not configured yet. Please contact Prism directly.', 'SERVICE_UNAVAILABLE');
}
$config = require $configFile;
if (!is_array($config) || empty($config['db']['name']) || empty($config['db']['user']) || empty($config['db']['password'])) {
    fail(503, 'Service configuration is incomplete.', 'SERVICE_UNAVAILABLE');
}
// Session cookies are Secure on HTTPS production; SameSite=Lax protects normal navigation.
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
         ((int)($_SERVER['SERVER_PORT'] ?? 0) === 443);
if (!$https && !in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1'], true)) {
    fail(503, 'Secure HTTPS is required.', 'HTTPS_REQUIRED');
}
session_name('PRISM_SESSION');
ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
session_set_cookie_params(['lifetime'=>0, 'path'=>'/', 'secure'=>$https, 'httponly'=>true, 'samesite'=>'Lax']);
session_start();
if (empty($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));

function database(): PDO {
    global $config;
    static $db;
    if ($db instanceof PDO) return $db;
    try {
        $db = new PDO(
            sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
                $config['db']['host'] ?? 'localhost', $config['db']['port'] ?? 3306, $config['db']['name']),
            $config['db']['user'], $config['db']['password'],
            [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC,
             PDO::ATTR_EMULATE_PREPARES=>false, PDO::ATTR_TIMEOUT=>5]
        );
        $db->exec("SET time_zone = '+00:00'");
        return $db;
    } catch (Throwable $exception) {
        error_log('Prism DB unavailable: '.$exception->getMessage());
        fail(503, 'Our enquiry service is temporarily unavailable. Please try again later.', 'SERVICE_UNAVAILABLE');
    }
}
function input(): array {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') fail(405,'Method not allowed.','METHOD_NOT_ALLOWED');
    if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) fail(415, 'Send JSON data.', 'UNSUPPORTED_MEDIA');
    if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 25000) fail(413, 'Request is too large.', 'TOO_LARGE');
    $raw = file_get_contents('php://input', false, null, 0, 25001);
    $data = json_decode($raw ?: '', true);
    if (!is_array($data) || array_is_list($data)) fail(400, 'Invalid request data.', 'BAD_JSON');
    return $data;
}
function csrf(): void {
    $received = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!is_string($received) || !hash_equals((string)($_SESSION['csrf'] ?? ''), $received)) fail(403,'Your session has expired. Refresh the page and try again.','CSRF');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $originHost = parse_url($origin, PHP_URL_HOST);
        $host = strtolower(explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]);
        if (!$originHost || strtolower($originHost) !== $host) fail(403, 'Invalid origin.', 'BAD_ORIGIN');
    }
}
function field(array $data, string $key, int $max = 255): string {
    $raw = $data[$key] ?? '';
    if (!is_string($raw)) fail(422,"Invalid $key value.",'INVALID_FIELD');
    $value = trim($raw);
    if (mb_strlen($value, 'UTF-8') > $max) fail(422,"$key is too long.",'INVALID_FIELD');
    return $value;
}
function email_field(array $data, string $key = 'email'): string {
    $email = strtolower(field($data, $key, 254));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) fail(422,'Enter a valid email address.','INVALID_EMAIL');
    return $email;
}
function require_user(): array {
    $uid = (int)($_SESSION['user_id'] ?? 0);
    if (!$uid) fail(401,'Please log in to continue.','LOGIN_REQUIRED');
    $stmt=database()->prepare('SELECT id, first_name, last_name, email, verified_at FROM users WHERE id=? LIMIT 1');
    $stmt->execute([$uid]);
    $user=$stmt->fetch();
    if (!$user || !$user['verified_at']) {
        unset($_SESSION['user_id']);
        fail(401,'Please log in again.','LOGIN_REQUIRED');
    }
    return $user;
}
function is_staff(array $user): bool {
    global $config;
    $list=array_map('strtolower', $config['staff_emails'] ?? []);
    return !empty($user['verified_at']) && in_array(strtolower($user['email']), $list, true);
}
function rate_limit(string $scope, string $identity, int $limit, int $window): void {
    global $config;
    $secret = $config['rate_secret'] ?? '';
    if (strlen($secret) < 32) fail(503, 'Security configuration is incomplete.','SERVICE_UNAVAILABLE');
    $key = hash_hmac('sha256', $scope.'|'.$identity, $secret);
    $db = database();
    try {
        $db->beginTransaction();
        $db->prepare('INSERT IGNORE INTO rate_limits (rate_key, attempts, window_end) VALUES (?,0,UTC_TIMESTAMP() - INTERVAL 1 SECOND)')->execute([$key]);
        $stmt=$db->prepare('SELECT attempts, window_end FROM rate_limits WHERE rate_key=? FOR UPDATE');
        $stmt->execute([$key]); $row=$stmt->fetch();
        $expired= strtotime((string)$row['window_end'].' UTC') < time();
        $attempts=$expired ? 1 : ((int)$row['attempts']+1);
        $end= $expired ? gmdate('Y-m-d H:i:s',time()+$window) : $row['window_end'];
        $db->prepare('UPDATE rate_limits SET attempts=?, window_end=? WHERE rate_key=?')->execute([$attempts,$end,$key]);
        $db->commit();
        if ($attempts>$limit) fail(429,'Too many attempts. Please try again later.','RATE_LIMIT');
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        error_log('Rate limit error: '.$e->getMessage());
        fail(503,'Service temporarily unavailable.','SERVICE_UNAVAILABLE');
    }
}
function client_ip(): string {
    // REMOTE_ADDR only; never trust X-Forwarded-For from the public internet.
    return substr((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'),0,64);
}
function smtp_ready(): bool {
    global $config;
    return is_file(dirname(__DIR__).'/vendor/autoload.php') &&
        !empty($config['smtp']['user']) && !empty($config['smtp']['password']) && !empty($config['smtp']['from']);
}
function send_email(string $to, string $subject, string $body): bool {
    global $config;
    if (!smtp_ready()) { error_log('Prism SMTP not configured / vendor missing'); return false; }
    require_once dirname(__DIR__).'/vendor/autoload.php';
    try {
        $m = new PHPMailer\PHPMailer\PHPMailer(true);
        $m->isSMTP();
        $m->Host = $config['smtp']['host'] ?? 'smtp.hostinger.com';
        $m->SMTPAuth = true;
        $m->Username = $config['smtp']['user'];
        $m->Password = $config['smtp']['password'];
        $m->Port = (int)($config['smtp']['port'] ?? 465);
        $m->SMTPSecure = $m->Port === 465 ? PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS : PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
        $m->CharSet = 'UTF-8';
        $m->Timeout = 10;
        $m->setFrom($config['smtp']['from'], 'Prism Travels');
        $m->addAddress($to);
        $m->Subject=$subject;
        $m->Body=$body;
        $m->isHTML(false);
        $m->send();
        return true;
    } catch (Throwable $e) {
        error_log('Prism SMTP failed: '.$e->getMessage());
        return false;
    }
}
function make_token(int $userId, string $purpose, int $seconds): string {
    $token=bin2hex(random_bytes(32));
    $hash=hash('sha256',$token);
    database()->prepare('DELETE FROM email_tokens WHERE user_id=? AND purpose=?')->execute([$userId,$purpose]);
    database()->prepare('INSERT INTO email_tokens (user_id,token_hash,purpose,expires_at) VALUES (?,?,?,?)')->execute([$userId,$hash,$purpose,gmdate('Y-m-d H:i:s',time()+$seconds)]);
    return $token;
}
function consume_token(string $token, string $purpose): ?array {
    if (!preg_match('/\A[a-f0-9]{64}\z/', $token)) return null;
    $stmt=database()->prepare('SELECT id,user_id FROM email_tokens WHERE token_hash=? AND purpose=? AND expires_at>UTC_TIMESTAMP() LIMIT 1');
    $stmt->execute([hash('sha256',$token),$purpose]);
    $row=$stmt->fetch();
    if (!$row) return null;
    database()->prepare('DELETE FROM email_tokens WHERE id=?')->execute([$row['id']]);
    return $row;
}
function app_url(): string {
    global $config;
    return rtrim((string)($config['app_url'] ?? 'https://tripbyprism.co.in'),'/');
}
