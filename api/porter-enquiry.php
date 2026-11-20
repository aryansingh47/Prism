<?php

declare(strict_types=1);

require __DIR__ . '/porter-bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    porter_json_response(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$payload = porter_read_json_body();
$data = [
    'name' => trim((string)($payload['name'] ?? '')),
    'email' => trim((string)($payload['email'] ?? '')),
    'phone' => trim((string)($payload['phone'] ?? '')),
    'origin' => trim((string)($payload['origin'] ?? '')),
    'destination' => trim((string)($payload['destination'] ?? '')),
    'travel_dates' => trim((string)($payload['travel_dates'] ?? '')),
    'duration' => trim((string)($payload['duration'] ?? '')),
    'travellers' => trim((string)($payload['travellers'] ?? '')),
    'budget' => trim((string)($payload['budget'] ?? '')),
    'trip_type' => trim((string)($payload['trip_type'] ?? '')),
    'notes' => trim((string)($payload['notes'] ?? '')),
    'source' => 'Porter Chatbot',
    'created_at' => gmdate('c'),
    'page' => trim((string)($payload['page'] ?? '')),
];

$errors = [];
if ($data['name'] === '') {
    $errors['name'] = 'Please share your name.';
}
if ($data['email'] === '' || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please provide a valid email address.';
}
if ($data['destination'] === '') {
    $errors['destination'] = 'Please tell us the destination or package you are interested in.';
}
if ($data['phone'] === '' && $data['notes'] === '') {
    $errors['phone'] = 'Please share a phone/WhatsApp number or add a note so the team can follow up.';
}

if ($errors !== []) {
    porter_json_response(['ok' => false, 'errors' => $errors], 422);
}

$reference = porter_generate_reference();
$record = array_merge($data, ['reference' => $reference]);

$config = porter_config();
$storage = (string)($config['enquiry_storage'] ?? (__DIR__ . '/../storage/porter-enquiries.jsonl'));
$dir = dirname($storage);
if (!is_dir($dir)) {
    @mkdir($dir, 0775, true);
}

$line = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
if (@file_put_contents($storage, $line, FILE_APPEND | LOCK_EX) === false) {
    porter_json_response(['ok' => false, 'error' => 'Unable to save the enquiry right now.'], 500);
}

$subject = 'New Porter enquiry · ' . $reference;
$body = "A new enquiry was submitted through Porter.\n\n" .
    "Reference: {$reference}\n" .
    "Name: {$record['name']}\n" .
    "Email: {$record['email']}\n" .
    "Phone/WhatsApp: {$record['phone']}\n" .
    "Origin city: {$record['origin']}\n" .
    "Destination/package: {$record['destination']}\n" .
    "Travel dates: {$record['travel_dates']}\n" .
    "Duration: {$record['duration']}\n" .
    "Travellers: {$record['travellers']}\n" .
    "Budget: {$record['budget']}\n" .
    "Trip type: {$record['trip_type']}\n" .
    "Notes: {$record['notes']}\n" .
    "Page: {$record['page']}\n" .
    "Created at (UTC): {$record['created_at']}\n";

$mailSent = porter_mail_notification(
    (string)($config['notification_email'] ?? ''),
    $subject,
    $body,
    (string)($config['from_email'] ?? 'noreply@tripbyprism.co.in'),
    (string)($config['from_name'] ?? 'Porter by Prism')
);

porter_json_response([
    'ok' => true,
    'reference' => $reference,
    'mail_sent' => $mailSent,
    'message' => 'Thanks — your enquiry has been sent to Prism. A consultant will follow up with you soon.',
]);

function porter_generate_reference(): string
{
    return 'PRM-' . gmdate('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 6));
}
