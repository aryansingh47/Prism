<?php

declare(strict_types=1);

function porter_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function porter_read_json_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function porter_config(): array
{
    static $config;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'provider' => 'openai',
        'openai_api_key' => getenv('OPENAI_API_KEY') ?: '',
        'openai_model' => getenv('OPENAI_MODEL') ?: 'gpt-4.1-mini',
        'openai_timeout_seconds' => 25,
        'notification_email' => getenv('PORTER_NOTIFICATION_EMAIL') ?: 'hello@tripbyprism.co.in',
        'from_email' => getenv('PORTER_FROM_EMAIL') ?: 'noreply@tripbyprism.co.in',
        'from_name' => getenv('PORTER_FROM_NAME') ?: 'Porter by Prism',
        'enquiry_storage' => __DIR__ . '/porter-enquiries.jsonl',
        'allow_fallback_without_ai' => true,
        'max_history_messages' => 12,
    ];

    $file = __DIR__ . '/prism-private/porter-config.php';
    if (is_file($file)) {
        $fromFile = require $file;
        if (is_array($fromFile)) {
            $defaults = array_replace($defaults, $fromFile);
        }
    }

    $config = $defaults;
    return $config;
}

function porter_knowledge(): array
{
    static $knowledge;
    if ($knowledge !== null) {
        return $knowledge;
    }

    $knowledge = require __DIR__ . '/../data/porter-knowledge.php';
    return $knowledge;
}

function porter_normalise(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9\s₹\-]/u', ' ', $value) ?? $value;
    $value = preg_replace('/\s+/', ' ', $value) ?? $value;
    return trim($value);
}

function porter_find_relevant_packages(string $message, array $knowledge, int $limit = 4): array
{
    $messageNorm = porter_normalise($message);
    $tokens = array_values(array_filter(explode(' ', $messageNorm), static fn ($item) => strlen($item) > 2));

    $scored = [];
    foreach ($knowledge['packages'] as $package) {
        $haystack = porter_normalise(
            $package['title'] . ' ' .
            ($package['summary'] ?? '') . ' ' .
            ($package['collection'] ?? '') . ' ' .
            implode(' ', $package['tags'] ?? []) . ' ' .
            implode(' ', $package['highlights'] ?? [])
        );

        $score = 0;
        foreach ($tokens as $token) {
            if (strpos($haystack, $token) !== false) {
                $score += 3;
            }
        }

        if (!empty($package['priority']) && preg_match('/winter|december|january|snow|christmas|new year/', $messageNorm)) {
            $score += 3;
        }
        if (!empty($package['on_request']) && preg_match('/auli|leh|tawang/', $messageNorm)) {
            $score += 2;
        }
        if (preg_match('/family|kids|child|children/', $messageNorm) && preg_match('/goa|kerala|jaipur|nainital|coorg|munnar/', $haystack)) {
            $score += 1;
        }
        if (preg_match('/honeymoon|couple|romantic/', $messageNorm) && preg_match('/kerala|kashmir|munnar|udaipur|goa|jaisalmer/', $haystack)) {
            $score += 1;
        }

        if ($score > 0) {
            $scored[] = ['score' => $score, 'package' => $package];
        }
    }

    usort($scored, static fn ($a, $b) => $b['score'] <=> $a['score']);
    $top = array_slice($scored, 0, $limit);
    return array_map(static fn ($row) => $row['package'], $top);
}

function porter_find_relevant_faqs(string $message, array $knowledge, int $limit = 2): array
{
    $messageNorm = porter_normalise($message);
    $matches = [];
    foreach ($knowledge['faqs'] as $faq) {
        $score = 0;
        foreach ($faq['keywords'] ?? [] as $keyword) {
            if (strpos($messageNorm, porter_normalise($keyword)) !== false) {
                $score += 2;
            }
        }
        if ($score > 0) {
            $matches[] = ['score' => $score, 'faq' => $faq];
        }
    }
    usort($matches, static fn ($a, $b) => $b['score'] <=> $a['score']);
    return array_map(static fn ($row) => $row['faq'], array_slice($matches, 0, $limit));
}

function porter_build_cards(array $packages): array
{
    $cards = [];
    foreach ($packages as $package) {
        $cards[] = [
            'title' => $package['title'],
            'subtitle' => ($package['days'] ?? '') . ' · ' . ($package['price'] ?? ''),
            'description' => $package['summary'] ?? '',
            'href' => $package['page'],
            'badge' => $package['collection'] ?? '',
            'cta_label' => 'View package',
        ];
    }
    return $cards;
}

function porter_default_suggestions(array $knowledge): array
{
    return $knowledge['suggested_prompts'] ?? [
        'Show me your best winter packages',
        'I need a family holiday',
        'Compare two destinations',
        'Help me plan my trip',
    ];
}

function porter_detect_language(string $message): string
{
    return preg_match('/[\x{0900}-\x{097F}]/u', $message) ? 'hi' : 'en';
}

function porter_mail_notification(string $to, string $subject, string $message, string $fromEmail, string $fromName): bool
{
    if ($to === '') {
        return false;
    }

    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/plain; charset=UTF-8',
        'From: ' . sprintf('%s <%s>', $fromName, $fromEmail),
        'Reply-To: ' . $fromEmail,
        'X-Mailer: PHP/' . phpversion(),
    ];

    return @mail($to, $subject, $message, implode("\r\n", $headers));
}
