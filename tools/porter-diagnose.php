<?php
declare(strict_types=1);
// Run only on terminal: php tools/porter-diagnose.php [--live]
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require dirname(__DIR__) . '/api/porter-bootstrap.php';
$settings = porter_settings();
$path = getenv('PORTER_CONFIG_PATH') ?: porter_private_dir() . '/porter-config.php';
$key = (string)($settings['openai_api_key'] ?? '');
$ready = porter_ready();
echo "Porter 2.0 diagnostic\n";
echo "Private config path: {$path}\n";
echo 'Config file exists: ' . (is_file($path) ? 'YES' : 'NO (environment key may be used)') . "\n";
echo 'PHP: ' . PHP_VERSION . "\n";
echo 'cURL: ' . (function_exists('curl_init') ? 'installed' : 'MISSING') . "\n";
echo 'mbstring: ' . (function_exists('mb_strlen') ? 'installed' : 'MISSING') . "\n";
echo 'Model: ' . (string)$settings['openai_model'] . "\n";
echo 'Key has valid-looking prefix: ' . ($ready ? 'YES (not yet validated)' : 'NO') . "\n";
echo 'Private directory: ' . (is_dir(porter_private_dir()) ? 'exists' : 'missing; it must be writable') . "\n";
if (!in_array('--live', $argv, true)) { echo "\nTo make one real paid API call, run: php tools/porter-diagnose.php --live\n"; exit($ready ? 0 : 1); }
if (!$ready) { fwrite(STDERR, "Configure your OpenAI API project key before using --live.\n"); exit(2); }
$payload = [
    'model' => (string)$settings['openai_model'],
    'store' => false,
    'instructions' => 'Reply with a very short greeting as Porter, Prism Travels travel concierge.',
    'input' => 'Say hello in one sentence.',
    'reasoning' => ['effort' => 'low'],
    'max_output_tokens' => 120,
];
$ch = curl_init('https://api.openai.com/v1/responses');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Authorization: Bearer '.$key,'Content-Type: application/json'],
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 40,
]);
$raw = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
$curlError = curl_errno($ch);
curl_close($ch);
$data = is_string($raw) ? json_decode($raw, true) : null;
echo "OpenAI HTTP status: {$status}\n";
if ($curlError) echo "Network/cURL error code: {$curlError}\n";
if ($status === 200 && is_array($data)) {
    $output = '';
    foreach (($data['output'] ?? []) as $item) foreach (($item['content'] ?? []) as $part) {
        if (($part['type'] ?? '') === 'output_text') $output .= (string)($part['text'] ?? '');
    }
    echo 'Model answered: ' . trim($output) . "\n";
    echo 'Input tokens: ' . (string)($data['usage']['input_tokens'] ?? 'unknown') . "\n";
    echo 'Output tokens: ' . (string)($data['usage']['output_tokens'] ?? 'unknown') . "\n";
    exit(0);
}
$code = is_array($data) ? (string)($data['error']['code'] ?? $data['error']['type'] ?? 'unknown') : 'unknown';
echo "OpenAI error code: {$code}\n";
echo "401: invalid key or missing permission; 429: rate limit or no credits; 400/404: model/access mismatch.\n";
exit(3);
