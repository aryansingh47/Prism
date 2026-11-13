<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
$data=input(); csrf();
$action=field($data,'action',32);
$ip=client_ip();
if ($action==='register') {
    rate_limit('register',$ip,8,3600);
    if (!smtp_ready()) fail(503,'Account registration is temporarily unavailable. Please enquire as a guest.','SMTP_NOT_READY');
    if (($data['terms'] ?? false)!==true) fail(422,'Please accept the terms and privacy notice.','CONSENT_REQUIRED');
    $first=field($data,'first_name',80);$last=field($data,'last_name',80);$email=email_field($data);
    if (!$first || !$last) fail(422,'Please provide your first and last name.','INVALID_NAME');
    $password=field($data,'password',200);
    if (strlen($password)<12 || strlen($password)>200) fail(422,'Choose a password of at least 12 characters.','WEAK_PASSWORD');
    $db=database();
    $exists=$db->prepare('SELECT id FROM users WHERE email=? LIMIT 1');$exists->execute([$email]);
    if ($exists->fetch()) fail(409,'This email is already registered. Try logging in or resetting your password.','EMAIL_REGISTERED');
    try {
        $db->prepare('INSERT INTO users(first_name,last_name,email,password_hash) VALUES(?,?,?,?)')->execute([$first,$last,$email,password_hash($password,PASSWORD_DEFAULT)]);
    } catch (PDOException $e) {
        if ($e->getCode()==='23000') fail(409,'This email is already registered.','EMAIL_REGISTERED');
        throw $e;
    }
    $uid=(int)$db->lastInsertId();
    $token=make_token($uid,'verify',86400);
    $link=app_url().'/api/verify.php?token='.rawurlencode($token);
    $sent=send_email($email,'Verify your Prism Travels account',"Hello $first,\n\nVerify your Prism Travels account by opening the secure link below:\n$link\n\nThis link expires in 24 hours. If you didn't register, ignore this email.\n\nPrism Travels");
    if (!$sent) fail(503,'Account created but verification email could not be delivered. Please contact Prism support.','EMAIL_DELIVERY');
    okay(['message'=>'Check your email for a verification link. You can continue as a guest in the meantime.']);
}
if ($action==='login') {
    $email=email_field($data);$password=field($data,'password',200);
    rate_limit('login-ip',$ip,25,900);rate_limit('login-email',$email,12,900);
    $q=database()->prepare('SELECT id,first_name,last_name,email,password_hash,verified_at FROM users WHERE email=? LIMIT 1');$q->execute([$email]);$user=$q->fetch();
    if (!$user || !password_verify($password,$user['password_hash'])) fail(401,'Incorrect email or password.','INVALID_LOGIN');
    if (!$user['verified_at']) fail(403,'Please verify your email before logging in.','UNVERIFIED');
    if (password_needs_rehash($user['password_hash'],PASSWORD_DEFAULT)) {
        database()->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($password,PASSWORD_DEFAULT),$user['id']]);
    }
    session_regenerate_id(true);$_SESSION['user_id']=(int)$user['id'];$_SESSION['csrf']=bin2hex(random_bytes(32));
    okay(['message'=>'Welcome back.', 'user'=>['first_name'=>$user['first_name'],'last_name'=>$user['last_name'], 'email'=>$email, 'staff'=>is_staff($user)], 'csrf'=>$_SESSION['csrf']]);
}
if ($action==='logout') {
    unset($_SESSION['user_id']);session_regenerate_id(true);$_SESSION['csrf']=bin2hex(random_bytes(32));
    okay(['message'=>'Signed out.','csrf'=>$_SESSION['csrf']]);
}
if ($action==='forgot') {
    $email=email_field($data);rate_limit('reset-ip',$ip,8,3600);rate_limit('reset-email',$email,4,3600);
    $q=database()->prepare('SELECT id,first_name FROM users WHERE email=? AND verified_at IS NOT NULL LIMIT 1');$q->execute([$email]);$user=$q->fetch();
    if ($user && smtp_ready()) {
        $token=make_token((int)$user['id'],'reset',3600);
        $link=app_url().'/account.html?reset='.rawurlencode($token);
        send_email($email,'Reset your Prism Travels password',"Hello {$user['first_name']},\n\nReset your Prism Travels password using this link:\n$link\n\nIt expires in one hour. If you didn't request it, ignore this email.");
    }
    okay(['message'=>'If an eligible account exists, a password reset link has been sent.']);
}
if ($action==='reset') {
    rate_limit('password-reset',$ip,10,3600);
    $token=field($data,'token',64);$password=field($data,'password',200);
    if (strlen($password)<12 || strlen($password)>200) fail(422,'New password must contain at least 12 characters.','WEAK_PASSWORD');
    $record=consume_token($token,'reset');
    if (!$record) fail(400,'This reset link is invalid or has expired.','INVALID_TOKEN');
    database()->prepare('UPDATE users SET password_hash=? WHERE id=?')->execute([password_hash($password,PASSWORD_DEFAULT),$record['user_id']]);
    database()->prepare('DELETE FROM email_tokens WHERE user_id=?')->execute([$record['user_id']]);
    okay(['message'=>'Password updated. You can now log in.']);
}
fail(400,'Unknown account action.','UNKNOWN_ACTION');
