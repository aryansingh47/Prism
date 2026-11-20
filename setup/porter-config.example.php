<?php
/**
 * Copy this file to setup/porter-config.php and fill in the real values.
 * This file is intentionally safe to commit; porter-config.php should not contain secrets in Git.
 */
return [
    // Primary AI provider.
    'provider' => 'openai',

    // OpenAI configuration.
    'openai_api_key' => 'replace-with-your-openai-api-key',
    'openai_model' => 'gpt-4.1-mini',
    'openai_timeout_seconds' => 25,

    // Notification and storage settings.
    'notification_email' => 'hello@tripbyprism.co.in',
    'from_email' => 'noreply@tripbyprism.co.in',
    'from_name' => 'Porter by Prism',
    'enquiry_storage' => __DIR__ . '/../storage/porter-enquiries.jsonl',

    // Runtime behaviour.
    'allow_fallback_without_ai' => true,
    'max_history_messages' => 12,
];
