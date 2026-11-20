<?php
declare(strict_types=1);

// Shared security and configuration functions for Porter v2.
ini_set('display_errors', '0');
ini_set('log_errors', '1');

function porter_reply(array $body, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: no-referrer');
    header('X-Frame-Options: DENY');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}
function porter_fail(int $status, string $code, string $message, ?int $retryAfter = null): never {
    if ($retryAfter !== null) header('Retry-After: ' . $retryAfter);
    porter_reply(['ok' => false, 'code' => $code, 'message' => $message], $status);
}
function porter_private_dir(): string {
    // Sibling of public_html: /home/username/domains/domain/prism-private when appropriate.
    // Keep API keys and rate-limiter files OUTSIDE public_html.
    $env = getenv('PRISM_PRIVATE_DIR');
    return is_string($env) && $env !== '' ? rtrim($env, '/') : dirname(__DIR__, 2) . '/prism-private';
}
function porter_settings(): array {
    static $settings = null;
    if ($settings !== null) return $settings;
    $settings = [
        'openai_api_key' => getenv('OPENAI_API_KEY') ?: '',
        'openai_model' => getenv('OPENAI_MODEL') ?: 'gpt-6.1-terra',
        'openai_timeout_seconds' => 35,
        'max_output_tokens' => 1050,
        'reasoning_effort' => 'low',
        'rate_limit_per_10min' => 15,
        'max_history_messages' => 10,
    ];
    $path = getenv('PORTER_CONFIG_PATH') ?: porter_private_dir() . '/porter-config.php';
    if (is_file($path)) {
        $loaded = require $path;
        if (is_array($loaded)) $settings = array_replace($settings, $loaded);
    }
    return $settings;
}
function porter_ready(): bool {
    $key = trim((string)(porter_settings()['openai_api_key'] ?? ''));
    return strlen($key) > 20 && str_starts_with($key, 'sk-')
        && !preg_match('/REPLACE|PASTE|EXAMPLE|YOUR_KEY|XXXXX/i', $key)
        && function_exists('curl_init');
}
function porter_knowledge(): array {
    static $knowledge = null;
    if ($knowledge === null) $knowledge = require dirname(__DIR__) . '/data/porter-knowledge.php';
    return $knowledge;
}
function porter_validate_request(): array {
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') porter_fail(405, 'METHOD_NOT_ALLOWED', 'Please use the Porter chat interface.');
    if (!str_starts_with(strtolower((string)($_SERVER['CONTENT_TYPE'] ?? '')), 'application/json')) {
        porter_fail(415, 'CONTENT_TYPE', 'Porter accepts JSON requests only.');
    }
    $length = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
    if ($length > 16000) porter_fail(413, 'REQUEST_TOO_LARGE', 'Please keep your messages concise.');
    $origin = (string)($_SERVER['HTTP_ORIGIN'] ?? '');
    if ($origin !== '') {
        $originHost = strtolower((string)parse_url($origin, PHP_URL_HOST));
        $requestHost = strtolower((string)($_SERVER['HTTP_HOST'] ?? ''));
        $requestHost = explode(':', $requestHost)[0];
        if ($originHost === '' || !hash_equals($requestHost, $originHost)) {
            porter_fail(403, 'ORIGIN', 'The request did not come from Prism’s website.');
        }
    }
    $data = json_decode((string)file_get_contents('php://input', false, null, 0, 16001), true);
    if (!is_array($data) || array_is_list($data)) porter_fail(400, 'BAD_JSON', 'The message could not be read.');
    return $data;
}
function porter_limit(): void {
    $settings = porter_settings();
    $limit = max(1, min(120, (int)($settings['rate_limit_per_10min'] ?? 15)));
    $directory = porter_private_dir() . '/porter-rate-limits';
    if (!is_dir($directory) && !@mkdir($directory, 0700, true) && !is_dir($directory)) {
        error_log('Porter: unable to create private rate-limit directory');
        porter_fail(503, 'SECURITY_STORAGE', 'Porter is temporarily unavailable. Please contact Prism.');
    }
    $remote = substr((string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 0, 72);
    $secret = (string)($settings['rate_secret'] ?? $settings['openai_api_key'] ?? '');
    if (strlen($secret) < 20) porter_fail(503, 'NOT_CONFIGURED', 'Porter has not been connected to OpenAI yet.');
    $key = hash_hmac('sha256', $remote, $secret);
    $path = $directory . '/' . $key . '.json';
    $stream = @fopen($path, 'c+');
    if (!$stream) porter_fail(503, 'SECURITY_STORAGE', 'Porter is temporarily unavailable.');
    try {
        if (!flock($stream, LOCK_EX)) porter_fail(503, 'SECURITY_STORAGE', 'Porter is temporarily unavailable.');
        $raw = stream_get_contents($stream);
        $stored = json_decode($raw ?: '{}', true);
        $now = time();
        $expiry = (int)($stored['expires'] ?? 0);
        $count = $expiry > $now ? (int)($stored['count'] ?? 0) : 0;
        if ($count >= $limit) {
            flock($stream, LOCK_UN);
            porter_fail(429, 'RATE_LIMIT', 'Too many messages for now. Please try again shortly.', max(10, $expiry - $now));
        }
        $expiry = $count === 0 ? $now + 600 : $expiry;
        rewind($stream); ftruncate($stream, 0);
        fwrite($stream, json_encode(['count' => $count + 1, 'expires' => $expiry])); fflush($stream);
        flock($stream, LOCK_UN);
    } finally { fclose($stream); }
}
function porter_length(string $text): int {
    if (function_exists('mb_strlen')) return mb_strlen($text, 'UTF-8');
    return preg_match_all('/./us', $text, $matches) ?: 0;
}
function porter_lower(string $text): string {
    return function_exists('mb_strtolower') ? mb_strtolower($text, 'UTF-8') : strtolower($text);
}
function porter_contains(string $haystack, string $needle): bool {
    return $needle !== '' && strpos($haystack, $needle) !== false;
}
function porter_clean_message($value, int $limit = 1700): string {
    if (!is_string($value)) return '';
    $value = trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', $value) ?? '');
    return porter_length($value) <= $limit ? $value : '';
}
function porter_historical_messages($history, int $max): array {
    if (!is_array($history)) return [];
    $items = [];
    foreach (array_slice($history, -max(0, min(12, $max))) as $item) {
        if (!is_array($item)) continue;
        $role = $item['role'] ?? '';
        if (!in_array($role, ['user','assistant'], true)) continue;
        $text = porter_clean_message($item['content'] ?? null, 1100);
        if ($text !== '') $items[] = ['role' => $role, 'content' => $text];
    }
    return $items;
}
function porter_reference_packages(string $text, array $knowledge): array {
    $text = porter_lower($text);
    $candidates = [];
    $winter = (bool)preg_match('/winter|snow|december|january|christmas|new year|सर्द|बर्फ/u', $text);
    foreach ($knowledge['packages'] as $p) {
        $score = 0;
        foreach (($p['tags'] ?? []) as $tag) {
            $tag = porter_lower((string)$tag);
            if (porter_length($tag) < 3 || in_array($tag, ['winter','india','year-round'], true)) continue;
            if (porter_contains($text, $tag)) $score += 5;
        }
        $title = porter_lower($p['title']);
        if (porter_contains($text, $title)) $score += 8;
        $leadingPlace = explode(' ', $title, 2)[0];
        if (porter_length($leadingPlace) >= 4 && porter_contains($text, $leadingPlace)) $score += 7;
        if ($winter && !empty($p['priority'])) $score += 2;
        if ($winter && ($p['season'] ?? '') === 'Winter package') $score += 1;
        if ($score > 0) $candidates[] = ['score' => $score, 'package' => $p];
    }
    usort($candidates, static fn($a,$b) => $b['score'] <=> $a['score']);
    return array_map(static fn($item) => $item['package'], array_slice($candidates, 0, preg_match('/compare|versus|\bvs\b/', $text) ? 2 : 3));
}
