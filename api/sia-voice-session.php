<?php
/**
 * SIA Voice pilot: authenticated Hostinger PHP -> OpenAI GPT-Live WebRTC.
 * This is deliberately NOT a monthly usage cap. Never enable for general users
 * until server-owned session termination and persistent quotas are deployed.
 */
declare(strict_types=1);
require __DIR__ . '/_bootstrap.php';

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
    fail(503, 'SIA Voice pilot is currently unavailable.', 'VOICE_DISABLED');
}
$allowed = array_values(array_filter(array_map('strtolower', $voiceConfig['voice_pilot_emails'] ?? []), 'strlen'));
if (!$allowed || !in_array(strtolower((string)$user['email']), $allowed, true)) {
    fail(403, 'SIA Voice pilot is currently available to selected verified accounts only.', 'VOICE_NOT_INVITED');
}
$apiKey = trim((string)($voiceConfig['openai_voice_api_key'] ?? $voiceConfig['openai_api_key'] ?? ''));
if ($apiKey === '' || !function_exists('curl_init')) {
    fail(503, 'SIA Voice is not configured for live calls yet.', 'VOICE_CONFIG');
}

$sdp = $data['sdp'] ?? null;
if (!is_string($sdp) || strlen($sdp) > 22000 || strlen($sdp) < 40 || !preg_match('/^v=0\r?\n/', $sdp)) {
    fail(422, 'Invalid WebRTC offer.', 'INVALID_OFFER');
}
// Prevent repeated session-start abuse. These limits DO NOT limit active call duration.
rate_limit('sia-voice-starts-hour', (string)$user['id'], 3, 3600);
rate_limit('sia-voice-starts-day', (string)$user['id'], 8, 86400);

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
    'notice' => 'Voice preview: no enforceable monthly time quota is active.',
]);
