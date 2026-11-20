<?php

declare(strict_types=1);

require __DIR__ . '/porter-bootstrap.php';

$config = porter_config();
$knowledge = porter_knowledge();
porter_json_response([
    'ok' => true,
    'chatbot' => $knowledge['brand']['chatbot_name'] ?? 'Porter',
    'provider' => $config['provider'] ?? 'openai',
    'has_api_key' => trim((string)($config['openai_api_key'] ?? '')) !== '',
    'package_count' => count($knowledge['packages'] ?? []),
]);
