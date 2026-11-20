<?php
/**
 * SIA Voice session-start throttling, backed by Prism's existing MySQL rate_limits
 * table. This controls the number of NEW calls, not a user's billed minutes.
 *
 * Both windows are reserved atomically, so a denied daily request cannot consume
 * an hourly attempt. A definitively rejected provider request can be refunded.
 */
declare(strict_types=1);

function sia_voice_reserve_start(int $userId, int $hourLimit, int $dayLimit): array
{
    global $config;
    $secret = (string)($config['rate_secret'] ?? '');
    if (strlen($secret) < 32) {
        fail(503, 'Voice security configuration is incomplete.', 'VOICE_CONFIG');
    }

    $definitions = [
        ['scope' => 'sia-voice-starts-v2-hour', 'seconds' => 3600, 'limit' => $hourLimit, 'label' => 'hour'],
        ['scope' => 'sia-voice-starts-v2-day', 'seconds' => 86400, 'limit' => $dayLimit, 'label' => 'day'],
    ];
    foreach ($definitions as &$definition) {
        $definition['key'] = hash_hmac('sha256', $definition['scope'] . '|' . $userId, $secret);
    }
    unset($definition);
    usort($definitions, static fn(array $a, array $b): int => strcmp($a['key'], $b['key']));

    $db = database();
    $updates = [];
    $denied = null;
    try {
        $db->beginTransaction();
        foreach ($definitions as $definition) {
            $db->prepare('INSERT IGNORE INTO rate_limits (rate_key, attempts, window_end) VALUES (?, 0, UTC_TIMESTAMP() - INTERVAL 1 SECOND)')
                ->execute([$definition['key']]);
            $statement = $db->prepare('SELECT attempts, window_end FROM rate_limits WHERE rate_key = ? FOR UPDATE');
            $statement->execute([$definition['key']]);
            $row = $statement->fetch();
            if (!$row) {
                throw new RuntimeException('Voice rate limit row missing');
            }
            $now = time();
            $windowEnd = strtotime((string)$row['window_end'] . ' UTC');
            $expired = $windowEnd === false || $windowEnd <= $now;
            $count = $expired ? 0 : (int)$row['attempts'];
            $until = $expired ? $now + $definition['seconds'] : $windowEnd;
            $updates[] = ['key' => $definition['key'], 'attempts' => $count + 1, 'until' => $until];
            if ($denied === null && $count >= $definition['limit']) {
                $denied = [
                    'limit' => $definition['limit'],
                    'label' => $definition['label'],
                    'retry' => max(1, $until - $now),
                ];
            }
        }

        if ($denied !== null) {
            $db->rollBack();
        } else {
            $update = $db->prepare('UPDATE rate_limits SET attempts = ?, window_end = ? WHERE rate_key = ?');
            foreach ($updates as $item) {
                $update->execute([$item['attempts'], gmdate('Y-m-d H:i:s', $item['until']), $item['key']]);
            }
            $db->commit();
        }
    } catch (Throwable $error) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        error_log('SIA Voice rate reservation failed: ' . $error->getMessage());
        fail(503, 'Voice is temporarily unavailable. Please try again later.', 'VOICE_RATE_STORAGE');
    }

    if ($denied !== null) {
        $minutes = (int)ceil($denied['retry'] / 60);
        header('Retry-After: ' . $denied['retry']);
        fail(
            429,
            'You have reached the limit of ' . $denied['limit'] . ' voice starts per ' . $denied['label'] .
            '. Please try again in approximately ' . $minutes . ' minute' . ($minutes === 1 ? '' : 's') . '.',
            'VOICE_START_LIMIT'
        );
    }

    return array_column($definitions, 'key');
}

/** Refund only after a definite provider HTTP rejection (never after a timeout). */
function sia_voice_refund_rejected_start(array $keys): void
{
    try {
        $update = database()->prepare(
            'UPDATE rate_limits SET attempts = GREATEST(0, attempts - 1) WHERE rate_key = ? AND window_end > UTC_TIMESTAMP()'
        );
        foreach ($keys as $key) {
            if (is_string($key) && preg_match('/\A[a-f0-9]{64}\z/', $key)) {
                $update->execute([$key]);
            }
        }
    } catch (Throwable $error) {
        // A refund problem must not expose database details to a website visitor.
        error_log('SIA Voice rate refund failed: ' . $error->getMessage());
    }
}
