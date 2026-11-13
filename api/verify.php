<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') fail(405,'Method not allowed.');
$token=(string)($_GET['token'] ?? '');
$row=consume_token($token,'verify');
if ($row) {
    database()->prepare('UPDATE users SET verified_at=UTC_TIMESTAMP() WHERE id=?')->execute([$row['user_id']]);
    header('Location: '.app_url().'/account.html?verified=1',true,303);
} else {
    header('Location: '.app_url().'/account.html?verified=invalid',true,303);
}
exit;
