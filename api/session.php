<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'GET') fail(405,'Method not allowed.');
$profile=null;
if (!empty($_SESSION['user_id'])) {
    $stmt=database()->prepare('SELECT id, first_name, last_name, email, verified_at FROM users WHERE id=? LIMIT 1');
    $stmt->execute([(int)$_SESSION['user_id']]);
    $u=$stmt->fetch();
    if ($u && $u['verified_at']) {
        $profile=['id'=>(int)$u['id'], 'first_name'=>$u['first_name'], 'last_name'=>$u['last_name'],
                  'email'=>$u['email'], 'staff'=>is_staff($u)];
    } else unset($_SESSION['user_id']);
}
okay(['csrf'=>$_SESSION['csrf'], 'user'=>$profile]);
