<?php
/**
 * Copy to ../prism-private/porter-config.php (a PRIVATE directory outside public_html).
 * Do not commit a populated copy, share it in a chat, or expose it through a URL.
 */
return [
    'openai_api_key' => 'sk-REPLACE_WITH_YOUR_PROJECT_KEY',
    'openai_model' => 'gpt-6.1-terra',
    'reasoning_effort' => 'low',
    'max_output_tokens' => 1050,
    'openai_timeout_seconds' => 35,
    'rate_limit_per_10min' => 15,
    'max_history_messages' => 10,
];
