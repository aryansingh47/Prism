<?php

declare(strict_types=1);

require __DIR__ . '/porter-bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    porter_json_response(['ok' => false, 'error' => 'Method not allowed.'], 405);
}

$payload = porter_read_json_body();
$message = trim((string)($payload['message'] ?? ''));
$history = is_array($payload['history'] ?? null) ? $payload['history'] : [];

if ($message === '') {
    porter_json_response(['ok' => false, 'error' => 'Message is required.'], 422);
}

$config = porter_config();
$knowledge = porter_knowledge();
$relevantPackages = porter_find_relevant_packages($message, $knowledge, 4);
$relevantFaqs = porter_find_relevant_faqs($message, $knowledge, 2);
$cards = porter_build_cards($relevantPackages);
$suggestions = porter_default_suggestions($knowledge);

$reply = porter_generate_reply($message, $history, $knowledge, $relevantPackages, $relevantFaqs, $config);
$language = porter_detect_language($message);

porter_json_response([
    'ok' => true,
    'reply' => $reply,
    'cards' => $cards,
    'suggestions' => array_slice($suggestions, 0, 6),
    'language' => $language,
    'handoff' => [
        'label' => $language === 'hi' ? 'मानव टीम से बात करें' : 'Talk to the Prism team',
        'href' => $knowledge['brand']['contact_page'] ?? 'contact.html#enquiry-form',
        'whatsapp' => $knowledge['brand']['whatsapp'] ?? 'https://wa.me/919217711610',
    ],
]);

function porter_generate_reply(string $message, array $history, array $knowledge, array $packages, array $faqs, array $config): string
{
    $apiKey = trim((string)($config['openai_api_key'] ?? ''));
    if ($apiKey !== '') {
        $reply = porter_generate_openai_reply($message, $history, $knowledge, $packages, $faqs, $config);
        if (is_string($reply) && trim($reply) !== '') {
            return trim($reply);
        }
    }

    return porter_generate_fallback_reply($message, $knowledge, $packages, $faqs);
}

function porter_generate_openai_reply(string $message, array $history, array $knowledge, array $packages, array $faqs, array $config): ?string
{
    $maxHistory = max(0, (int)($config['max_history_messages'] ?? 12));
    $history = array_slice($history, -$maxHistory);

    $systemPrompt = porter_build_system_prompt($knowledge, $packages, $faqs);
    $messages = [['role' => 'system', 'content' => $systemPrompt]];

    foreach ($history as $item) {
        if (!is_array($item)) {
            continue;
        }
        $role = ($item['role'] ?? '') === 'assistant' ? 'assistant' : 'user';
        $content = trim((string)($item['content'] ?? ''));
        if ($content !== '') {
            $messages[] = ['role' => $role, 'content' => $content];
        }
    }
    $messages[] = ['role' => 'user', 'content' => $message];

    $payload = [
        'model' => (string)($config['openai_model'] ?? 'gpt-4.1-mini'),
        'messages' => $messages,
        'temperature' => 0.4,
        'max_tokens' => 650,
    ];

    $ch = curl_init('https://api.openai.com/v1/chat/completions');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $config['openai_api_key'],
        ],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        CURLOPT_TIMEOUT => max(10, (int)($config['openai_timeout_seconds'] ?? 25)),
    ]);

    $raw = curl_exec($ch);
    $curlErr = curl_error($ch);
    $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if (!is_string($raw) || $raw === '' || $curlErr !== '' || $status < 200 || $status >= 300) {
        return null;
    }

    $json = json_decode($raw, true);
    $content = $json['choices'][0]['message']['content'] ?? null;
    if (is_string($content) && trim($content) !== '') {
        return trim($content);
    }

    if (is_array($content)) {
        $combined = '';
        foreach ($content as $chunk) {
            if (isset($chunk['text']) && is_string($chunk['text'])) {
                $combined .= $chunk['text'];
            }
        }
        if (trim($combined) !== '') {
            return trim($combined);
        }
    }

    return null;
}

function porter_build_system_prompt(array $knowledge, array $packages, array $faqs): string
{
    $brand = $knowledge['brand'];
    $packageLines = [];
    foreach ($packages as $package) {
        $packageLines[] = sprintf(
            '- %s | %s | %s | %s | %s | %s',
            $package['title'],
            $package['collection'] ?? '',
            $package['days'] ?? '',
            $package['price'] ?? '',
            $package['summary'] ?? '',
            $package['page'] ?? ''
        );
    }

    $faqLines = [];
    foreach ($faqs as $faq) {
        $faqLines[] = '- Q: ' . $faq['question'] . ' A: ' . $faq['answer'];
    }

    $services = implode(', ', $brand['services'] ?? []);
    $packageText = implode("
", $packageLines);
    $faqText = implode("
", $faqLines);

    return <<<PROMPT
You are {$brand['chatbot_name']}, the intelligent travel assistant for {$brand['name']}.

Brand facts:
- Short name: {$brand['short_name']}
- Tagline: {$brand['tagline']}
- Head office: {$brand['head_office']}
- Contact page: {$brand['contact_page']}
- WhatsApp: {$brand['whatsapp']}
- Core services: {$services}

Important operating rules:
1. Be warm, polished and concise.
2. Answer in the same language as the user when practical. You may use Hindi or Hinglish if the user does.
3. Only use information that is explicitly provided here.
4. Never invent live availability, confirmations, supplier rates or hotel availability.
5. Be clear that prices are indicative and must be confirmed before booking.
6. If the user asks to confirm or book, advise them to submit an enquiry or speak to Prism directly.
7. When relevant, recommend one to three packages and explain why they fit.
8. If the message is broad, ask one or two smart follow-up questions about budget, dates, travellers or preferences.
9. Mention if a package is on request because of permits, road access or winter operations.
10. If you do not know something, say so and offer a human follow-up.

Relevant package context:
{$packageText}

Relevant FAQ context:
{$faqText}

Generic business notes:
- Prism is currently an enquiry-led website, not a live booking engine.
- Air or train fares are excluded unless specifically stated.
- Submitting an enquiry does not confirm a booking.

Reply in plain text only. Do not use markdown tables. Keep paragraphs short and skimmable.
PROMPT;
}

function porter_generate_fallback_reply(string $message, array $knowledge, array $packages, array $faqs): string
{
    $language = porter_detect_language($message);

    if (!empty($packages)) {
        $lines = [];
        foreach (array_slice($packages, 0, 3) as $package) {
            $suffix = !empty($package['on_request'])
                ? ($language === 'hi' ? ' (on request / availability dependent)' : ' (on request / availability dependent)')
                : '';
            $lines[] = sprintf('%s — %s — %s%s', $package['title'], $package['days'] ?? '', $package['price'] ?? '', $suffix);
        }

        if ($language === 'hi') {
            return "मैं Porter हूँ — Prism Travels का travel assistant. आपके अनुरोध के आधार पर ये options अच्छे लग रहे हैं:\n\n" . implode("\n", $lines) . "\n\nये rates indicative हैं और final confirmation dates, hotel availability और vehicle options पर depend करेगी. अगर आप चाहें, तो मैं आपके लिए destination, budget, duration और travel style के आधार पर और narrow down कर सकता हूँ — या आप सीधे enquiry भी submit कर सकते हैं.";
        }

        return "I’m Porter, Prism’s travel assistant. Based on your request, these options look like a strong fit:\n\n" . implode("\n", $lines) . "\n\nAll prices are indicative and need to be reconfirmed for your dates, hotels and vehicle preferences. If you’d like, I can narrow this down further based on your budget, trip duration, travellers and preferred style — or you can submit an enquiry for a human follow-up.";
    }

    if (!empty($faqs)) {
        $faq = $faqs[0];
        return (string)$faq['answer'];
    }

    if ($language === 'hi') {
        return "मैं Porter हूँ — Prism Travels का AI travel assistant. मैं destinations, Prism packages, winter getaways, budgeting और trip planning में मदद कर सकता हूँ. आप destination, budget, dates या travellers के बारे में थोड़ा बताएँ, और मैं suitable options suggest करूँगा.";
    }

    return "I’m Porter, Prism’s AI travel assistant. I can help with Prism packages, winter getaways, destination ideas, budget guidance and next-step travel enquiries. Tell me your destination, budget, travel month or traveller type, and I’ll suggest suitable options.";
}
