<?php
declare(strict_types=1);
require __DIR__ . '/porter-bootstrap.php';
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') porter_fail(405, 'METHOD_NOT_ALLOWED', 'Method not allowed.');
porter_reply([
    'ok' => true,
    'ready' => porter_ready(),
    'service' => 'Porter',
    'model' => (string)(porter_settings()['openai_model'] ?? 'gpt-6.1-terra'),
    'note' => 'Ready means configured, not that a live OpenAI request has succeeded.',
]);
