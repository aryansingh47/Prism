<?php
/**
 * SIA Voice pilot: authenticated Hostinger PHP -> OpenAI GPT-Live WebRTC.
 * This is deliberately NOT a monthly usage cap. Session-start limits reduce
 * abuse, but cannot enforce monthly time quotas or remotely terminate calls.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';
require __DIR__ . '/sia-voice-rate.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Method not allowed.', 'METHOD_NOT_ALLOWED');
}
$data = input();
csrf();
$user = require_user(); // Validates the DB session and verified_at field.

$privateFile = dirname(__DIR__, 2) . '/prism-private/porter-config.php';
if (!is_file($privateFile)) {
    fail(503, 'SIA Voice is not configured.', 'VOICE_DISABLED');
}
$voiceConfig = require $privateFile;
if (!is_array($voiceConfig) || empty($voiceConfig['voice_pilot_enabled'])) {
    fail(503, 'SIA Voice is currently unavailable.', 'VOICE_DISABLED');
}
// Any signed-in, email-verified Prism member can use SIA Voice.
// require_user() above enforces that rule server-side.
$apiKey = trim((string)($voiceConfig['openai_voice_api_key'] ?? $voiceConfig['openai_api_key'] ?? ''));
if ($apiKey === '' || !function_exists('curl_init')) {
    fail(503, 'SIA Voice is not configured for live calls yet.', 'VOICE_CONFIG');
}

$sdp = $data['sdp'] ?? null;
if (!is_string($sdp) || strlen($sdp) > 22000 || strlen($sdp) < 40 || !preg_match('/^v=0\r?\n/', $sdp)) {
    fail(422, 'Invalid WebRTC offer.', 'INVALID_OFFER');
}
// A new start budget avoids retaining earlier pilot's 3/hour lockouts.
// Caps are configurable privately; keep them conservative while monthly quotas are absent.
$startsPerHour = min(12, max(1, (int)($voiceConfig['voice_starts_per_hour'] ?? 8)));
$startsPerDay = min(30, max($startsPerHour, (int)($voiceConfig['voice_starts_per_day'] ?? 20)));
$startKeys = sia_voice_reserve_start((int)$user['id'], $startsPerHour, $startsPerDay);

$brand = 'SIA, the voice travel assistant for Prism Travels, a travel agency in India.';
$instructions = $brand . " Speak warmly, naturally and concisely in the customer's language (English, Hindi or Hinglish). "
    . 'You are an AI-generated voice. You help customers discover holiday packages and decide what to enquire about. '
    . 'Never invent airline fares, hotel availability, live prices, permit approvals, booking confirmations or guarantees. '
    . 'All listed prices are indicative per person on twin sharing and require a final quote. '
    . 'Ask one clarification at a time and direct guests to the Contact / Plan My Trip form for booking requests. '
    . 'Do not solicit passwords, payment details or sensitive identity documents. '
    . 'If you cannot verify something, say the Prism team must confirm it.';

$knowledgeFile = dirname(__DIR__) . '/data/porter-knowledge.php';
if (is_file($knowledgeFile)) {
    $knowledge = require $knowledgeFile;
    if (is_array($knowledge) && !empty($knowledge['packages']) && is_array($knowledge['packages'])) {
        $lines = [];
        foreach (array_slice($knowledge['packages'], 0, 25) as $package) {
            $lines[] = implode(' | ', [
                (string)($package['title'] ?? ''),
                (string)($package['days'] ?? ''),
                (string)($package['price'] ?? ''),
                (string)($package['summary'] ?? ''),
                !empty($package['on_request']) ? 'Available on request only' : 'Indicative only',
            ]);
        }
        $instructions .= "\n\nApproved Prism package context (not live inventory):\n" . implode("\n", $lines);
    }
}

$session = [
    'session' => [
        'model' => (string)($voiceConfig['openai_voice_model'] ?? 'gpt-live-1.1'),
        'instructions' => $instructions,
        'audio' => ['output' => ['voice' => 'marin']],
    ],
    'transport' => ['type' => 'webrtc', 'sdp' => $sdp],
];

$handle = curl_init('https://api.openai.com/v1/live/sessions');
if (!$handle) fail(503, 'Cannot initialize voice service.', 'VOICE_UPSTREAM');

curl_setopt_array($handle, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json',
        'Accept: application/json',
        'OpenAI-Safety-Identifier: ' . hash_hmac('sha256', (string)$user['id'], (string)($config['rate_secret'] ?? $apiKey)),
    ],
    CURLOPT_POSTFIELDS => json_encode($session, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT => 35,
]);
$raw = curl_exec($handle);
$status = (int)curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
$curlError = curl_error($handle);
curl_close($handle);
if (!is_string($raw) || $raw === '' || $status < 200 || $status >= 300) {
    // Avoid returning provider internals, tokens, keys or user data to the browser.
    error_log('SIA Voice provider connection error status=' . $status . ' network=' . ($curlError !== '' ? 'yes' : 'no'));
    // Refund deterministic rejections, but keep 429/5xx counted to avoid retry storms.
    if (in_array($status, [400, 401, 403, 404, 422], true)) sia_voice_refund_rejected_start($startKeys);
    if ($status === 401 || $status === 403) fail(502, 'SIA Voice authentication is unavailable. Contact Prism.', 'VOICE_PROVIDER_AUTH');
    if ($status === 429) fail(503, 'SIA Voice has reached a provider usage limit. Try again later.', 'VOICE_PROVIDER_LIMIT');
    fail(502, 'Unable to establish a voice call right now.', 'VOICE_PROVIDER');
}

$result = json_decode($raw, true);
$answer = is_array($result) ? ($result['transport']['sdp'] ?? null) : null;
if (!is_string($answer) || !str_starts_with($answer, 'v=0')) {
    fail(502, 'Voice service returned an invalid connection answer.', 'VOICE_BAD_RESPONSE');
}
okay([
    'sdp' => $answer,
    'session_id' => (string)($result['session']['id'] ?? ''),
    'notice' => 'SIA Voice does not yet have a server-enforced monthly time allowance.',
]);