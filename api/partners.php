<?php
declare(strict_types=1);
/** Prism partner onboarding + approved supplier self-service. */
require __DIR__.'/_bootstrap.php';

function partner_phone(string $phone): string {
    $digits = preg_replace('/\D+/', '', $phone);
    if (!is_string($digits) || strlen($digits) < 10 || strlen($digits) > 15 || !preg_match('/^\+?[0-9\s().-]+$/', $phone)) {
        fail(422, 'Enter a valid phone number containing 10–15 digits.', 'INVALID_PHONE');
    }
    return $phone;
}
function partner_record(): ?array {
    $id=(int)($_SESSION['prism_partner_id'] ?? 0);
    if (!$id) return null;
    $stmt=database()->prepare('SELECT id,business_name,category,star_rating,contact_name,email,phone,city,state,address,postal_code,website,registration_id,description,email_verified_at,status,reviewer_note,created_at FROM prism_partners WHERE id=?');
    $stmt->execute([$id]);
    $partner=$stmt->fetch();
    if (!$partner) unset($_SESSION['prism_partner_id']);
    return $partner ?: null;
}
function require_partner(bool $approved=false): array {
    $partner=partner_record();
    if (!$partner) fail(401, 'Sign in as a partner to continue.', 'PARTNER_LOGIN_REQUIRED');
    if ($approved && (!$partner['email_verified_at'] || $partner['status'] !== 'approved')) {
        fail(403, 'Your application must be verified and approved before managing offers.', 'PARTNER_NOT_APPROVED');
    }
    return $partner;
}
function partner_staff(): array {
    $staff=require_user();
    if (!is_staff($staff)) fail(403, 'Staff access is required.', 'STAFF_REQUIRED');
    return $staff;
}
function partner_public(array $row): array {
    unset($row['password_hash'], $row['reviewer_note']);
    return $row;
}
function partner_offers(int $partnerId): array {
    $stmt=database()->prepare('SELECT id,name,offer_type,description,capacity,indicative_price,currency,status,created_at FROM prism_partner_offerings WHERE partner_id=? ORDER BY created_at DESC LIMIT 60');
    $stmt->execute([$partnerId]);
    return $stmt->fetchAll();
}
function partner_base_url(): string {
    global $config;
    $value=rtrim((string)($config['partner_base_url'] ?? 'https://tripbyprism.co.in'), '/');
    if (!str_starts_with($value, 'https://')) fail(503,'Invalid partner service URL.','SERVICE_UNAVAILABLE');
    return $value;
}
function partner_verify_url(string $token): string {
    return partner_base_url().'/api/partners.php?action=verify&token='.rawurlencode($token);
}
function partner_send_verification(int $partnerId, string $email, string $name): bool {
    $token=bin2hex(random_bytes(32));
    $db=database();
    $db->prepare('DELETE FROM prism_partner_verify_tokens WHERE partner_id=? AND purpose=\'verify\'')->execute([$partnerId]);
    $db->prepare("INSERT INTO prism_partner_verify_tokens (partner_id,token_hash,purpose,expires_at) VALUES (?,?,'verify',DATE_ADD(UTC_TIMESTAMP(),INTERVAL 24 HOUR))")->execute([$partnerId,hash('sha256',$token)]);
    $body="Hello $name,\n\nThank you for applying to become a Prism travel partner.\n\nPlease verify your email address within 24 hours:\n".partner_verify_url($token)."\n\nThis confirms your email only; it does not approve or publish your business. Our team reviews applications manually.\n\nPrism Travels";
    return send_email($email,'Verify your Prism partner email',$body);
}
function partner_notice_staff(string $subject, string $body): void {
    global $config;
    $email=(string)($config['notify_email'] ?? '');
    if (filter_var($email,FILTER_VALIDATE_EMAIL)) send_email($email,$subject,$body);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') {
    $action=(string)($_GET['action'] ?? 'session');
    if ($action === 'verify') {
        $token=(string)($_GET['token'] ?? '');
        if (!preg_match('/^[a-f0-9]{64}$/D',$token)) {
            header('Location: /partners.html?verified=invalid',true,303);exit;
        }
        $db=database();
        $db->beginTransaction();
        try {
            $q=$db->prepare('SELECT id,partner_id FROM prism_partner_verify_tokens WHERE token_hash=? AND purpose=\'verify\' AND expires_at>UTC_TIMESTAMP() FOR UPDATE');
            $q->execute([hash('sha256',$token)]);
            $record=$q->fetch();
            if (!$record) { $db->rollBack();header('Location: /partners.html?verified=invalid',true,303);exit; }
            $db->prepare('UPDATE prism_partners SET email_verified_at=UTC_TIMESTAMP() WHERE id=?')->execute([$record['partner_id']]);
            $db->prepare('DELETE FROM prism_partner_verify_tokens WHERE partner_id=? AND purpose=\'verify\'')->execute([$record['partner_id']]);
            $db->commit();
            header('Location: /partners.html?verified=1',true,303);exit;
        } catch (Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            error_log('Partner verify failed: '.$e->getMessage());
            fail(503,'Verification temporarily unavailable.','SERVICE_UNAVAILABLE');
        }
    }
    if ($action === 'session') {
        $partner=partner_record();
        okay(['csrf'=>$_SESSION['csrf'],'partner'=>$partner ? partner_public($partner) : null, 'offers'=>$partner ? partner_offers((int)$partner['id']) : []]);
    }
    if ($action === 'admin') {
        partner_staff();
        $db=database();
        $partners=$db->query('SELECT id,business_name,category,star_rating,contact_name,email,phone,city,state,address,website,registration_id,description,email_verified_at,status,reviewer_note,created_at FROM prism_partners ORDER BY FIELD(status,\'pending\',\'approved\',\'rejected\',\'suspended\'),created_at DESC LIMIT 200')->fetchAll();
        $offers=$db->query('SELECT o.id,o.partner_id,o.name,o.offer_type,o.description,o.capacity,o.indicative_price,o.currency,o.status,o.created_at,p.business_name FROM prism_partner_offerings o JOIN prism_partners p ON p.id=o.partner_id ORDER BY FIELD(o.status,\'pending\',\'approved\',\'rejected\'),o.created_at DESC LIMIT 200')->fetchAll();
        okay(['partners'=>$partners,'offers'=>$offers]);
    }
    fail(404,'Unknown endpoint.','NOT_FOUND');
}

$data=input();csrf();
$action=field($data,'action',30);
$db=database();

if ($action === 'register') {
    rate_limit('partner-register',client_ip(),4,3600);
    if (!smtp_ready()) fail(503,'Partner registration is temporarily unavailable. Please contact Prism.', 'MAIL_UNAVAILABLE');
    if (($data['consent'] ?? null) !== true) fail(422,'Please agree to the privacy notice.','CONSENT_REQUIRED');
    if (!empty($data['website_field'])) okay(['message'=>'If eligible, you will receive a verification email.']); // honeypot
    $name=field($data,'business_name',150);
    $category=field($data,'category',30);
    $categories=['hotel','motel','resort','homestay','transport','activities','local_guide','other'];
    $starRaw=$data['star_rating'] ?? '';
    $star=$starRaw === '' ? null : filter_var($starRaw,FILTER_VALIDATE_INT,['options'=>['min_range'=>1,'max_range'=>5]]);
    if (!in_array($category,$categories,true) || $star===false || (!$star && $starRaw !== '')) fail(422,'Choose a valid partner category and rating.','INVALID_CATEGORY');
    if (!in_array($category,['hotel','motel','resort'],true) && $star!==null) fail(422,'Star ratings are only for accommodation partners.','INVALID_CATEGORY');
    $contact=field($data,'contact_name',120);
    $email=email_field($data);
    $phone=partner_phone(field($data,'phone',25));
    $city=field($data,'city',100);$state=field($data,'state',100);
    $address=field($data,'address',250);$postal=field($data,'postal_code',15);
    $website=field($data,'website_url',255);
    if ($website !== '' && (!filter_var($website,FILTER_VALIDATE_URL) || !in_array(strtolower((string)parse_url($website,PHP_URL_SCHEME)),['https','http'],true))) fail(422,'Enter a valid website URL.','INVALID_WEBSITE');
    $reg=field($data,'registration_id',80);
    $description=field($data,'description',1400);
    $password=field($data,'password',250);
    if (!$name || !$contact || !$city || !$state || !$address || mb_strlen($description)<20) fail(422,'Complete business, address and description fields.','INVALID_FIELD');
    if (strlen($password)<12 || !preg_match('/[A-Za-z]/',$password) || !preg_match('/\d/',$password)) fail(422,'Password must contain 12+ characters, including letters and a number.','WEAK_PASSWORD');
    try {
        $stmt=$db->prepare('INSERT INTO prism_partners (business_name,category,star_rating,contact_name,email,phone,city,state,address,postal_code,website,registration_id,description,password_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$name,$category,$star,$contact,$email,$phone,$city,$state,$address,$postal,$website,$reg,$description,password_hash($password,PASSWORD_DEFAULT)]);
    } catch (PDOException $e) {
        if (($e->errorInfo[1] ?? 0)==1062) fail(409,'An account with that email already exists. Sign in or contact our team.','EMAIL_IN_USE');
        throw $e;
    }
    $id=(int)$db->lastInsertId();
    $sent=partner_send_verification($id,$email,$contact);
    partner_notice_staff('New partner application #'.$id, "New partner application: $name ($category), $city, $state.\nSign in to the restricted partner review page to review this application.");
    okay(['message'=>$sent ? 'Application received. Check your email to verify your account; approval is subject to review.' : 'Application received, but verification email could not be delivered. Please contact Prism for assistance.']);
}
if ($action === 'login') {
    rate_limit('partner-login',client_ip(),10,3600);
    $email=email_field($data);
    $password=field($data,'password',250);
    $stmt=$db->prepare('SELECT id,password_hash FROM prism_partners WHERE email=? LIMIT 1');
    $stmt->execute([$email]);$record=$stmt->fetch();
    if (!$record || !password_verify($password,$record['password_hash'])) fail(401,'Invalid email or password.','BAD_CREDENTIALS');
    session_regenerate_id(true);
    $_SESSION['prism_partner_id']=(int)$record['id'];
    okay(['message'=>'Signed in.','partner'=>partner_public(partner_record() ?: [])]);
}
if ($action === 'logout') {
    unset($_SESSION['prism_partner_id']);
    session_regenerate_id(true);
    okay(['message'=>'Signed out.']);
}
if ($action === 'resend_verification') {
    rate_limit('partner-resend',client_ip(),3,3600);
    $email=email_field($data);
    $stmt=$db->prepare('SELECT id,contact_name,email_verified_at FROM prism_partners WHERE email=? LIMIT 1');
    $stmt->execute([$email]);$record=$stmt->fetch();
    if ($record && !$record['email_verified_at'] && smtp_ready()) partner_send_verification((int)$record['id'],$email,$record['contact_name']);
    okay(['message'=>'If this email has an unverified partner account, a verification link has been sent.']);
}
if ($action === 'request_reset') {
    rate_limit('partner-password-reset',client_ip(),4,3600);
    $email=email_field($data);
    $stmt=$db->prepare('SELECT id,contact_name FROM prism_partners WHERE email=? LIMIT 1');
    $stmt->execute([$email]);$account=$stmt->fetch();
    if ($account && smtp_ready()) {
        $token=bin2hex(random_bytes(32));
        $db->prepare("DELETE FROM prism_partner_verify_tokens WHERE partner_id=? AND purpose='reset'")->execute([$account['id']]);
        $db->prepare("INSERT INTO prism_partner_verify_tokens (partner_id,token_hash,purpose,expires_at) VALUES (?,?,'reset',DATE_ADD(UTC_TIMESTAMP(),INTERVAL 30 MINUTE))")->execute([$account['id'],hash('sha256',$token)]);
        $url=partner_base_url().'/partners.html?reset='.rawurlencode($token);
        send_email($email,'Reset your Prism partner password',"Hello {$account['contact_name']},\n\nReset your partner password using this one-time link (valid for 30 minutes):\n$url\n\nIf you didn't request this, you can ignore it.\n\nPrism Travels");
    }
    okay(['message'=>'If an account exists for that email address, a password reset link has been sent.']);
}
if ($action === 'reset_password') {
    rate_limit('partner-password-change',client_ip(),6,3600);
    $token=field($data,'token',64);$password=field($data,'password',250);
    if (!preg_match('/^[a-f0-9]{64}$/D',$token)) fail(422,'Invalid or expired reset link.','INVALID_TOKEN');
    if (strlen($password)<12 || !preg_match('/[A-Za-z]/',$password) || !preg_match('/\d/',$password)) fail(422,'Password must contain 12+ characters, letters and a number.','WEAK_PASSWORD');
    $db->beginTransaction();
    try {
        $stmt=$db->prepare("SELECT partner_id FROM prism_partner_verify_tokens WHERE token_hash=? AND purpose='reset' AND expires_at>UTC_TIMESTAMP() FOR UPDATE");
        $stmt->execute([hash('sha256',$token)]);$row=$stmt->fetch();
        if (!$row) { $db->rollBack();fail(422,'This reset link is invalid or expired.','INVALID_TOKEN'); }
        $db->prepare('UPDATE prism_partners SET password_hash=? WHERE id=?')->execute([password_hash($password,PASSWORD_DEFAULT),$row['partner_id']]);
        $db->prepare("DELETE FROM prism_partner_verify_tokens WHERE partner_id=? AND purpose='reset'")->execute([$row['partner_id']]);
        $db->commit();
    } catch (Throwable $e) {
        if ($db->inTransaction()) $db->rollBack();
        throw $e;
    }
    unset($_SESSION['prism_partner_id']);
    okay(['message'=>'Password updated. You can now sign in.']);
}
if ($action === 'create_offer') {
    $partner=require_partner(true);
    rate_limit('partner-offer:'.(int)$partner['id'],client_ip(),20,3600);
    $name=field($data,'name',140);$type=field($data,'offer_type',20);
    $description=field($data,'description',1500);
    $capacityRaw=$data['capacity'] ?? '';
    $capacity=$capacityRaw === '' ? null : filter_var($capacityRaw,FILTER_VALIDATE_INT,['options'=>['min_range'=>1,'max_range'=>999]]);
    $priceRaw=$data['indicative_price'] ?? '';
    $price=($priceRaw === '' || $priceRaw === null) ? null : filter_var($priceRaw,FILTER_VALIDATE_FLOAT);
    if (!$name || mb_strlen($description)<20 || !in_array($type,['room','vehicle','experience','other'],true) || $capacity===false || $price===false || ($price!==null && ($price<0 || $price>999999999))) fail(422,'Check the offering name, description, capacity and indicative price.','INVALID_OFFER');
    $stmt=$db->prepare('INSERT INTO prism_partner_offerings (partner_id,name,offer_type,description,capacity,indicative_price,currency) VALUES (?,?,?,?,?,?,\'INR\')');
    $stmt->execute([$partner['id'],$name,$type,$description,$capacity,$price]);
    partner_notice_staff('New partner offering pending review',"Partner: {$partner['business_name']}\nOffering: $name\nReview via Partner Administration.");
    okay(['message'=>'Offering submitted for staff review. It is not publicly listed or bookable.']);
}
if ($action === 'delete_offer') {
    $partner=require_partner();
    $id=filter_var($data['id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    if ($id===false) fail(422,'Invalid offering.','INVALID_ID');
    $stmt=$db->prepare('DELETE FROM prism_partner_offerings WHERE id=? AND partner_id=?');
    $stmt->execute([$id,$partner['id']]);
    okay(['message'=>'Offering removed.']);
}
if ($action === 'admin_partner') {
    $staff=partner_staff();
    $id=filter_var($data['id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $status=field($data,'status',16);
    $note=field($data,'reviewer_note',500);
    if ($id===false || !in_array($status,['approved','rejected','suspended','pending'],true)) fail(422,'Invalid review status.','INVALID_STATUS');
    $stmt=$db->prepare('SELECT id,email,business_name,email_verified_at FROM prism_partners WHERE id=?');$stmt->execute([$id]);$partner=$stmt->fetch();
    if (!$partner) fail(404,'Partner not found.','NOT_FOUND');
    if ($status==='approved' && !$partner['email_verified_at']) fail(422,'Verify the partner email before approval.','VERIFY_EMAIL_FIRST');
    $db->prepare('UPDATE prism_partners SET status=?,reviewer_note=?,reviewed_at=UTC_TIMESTAMP(),reviewed_by=? WHERE id=?')->execute([$status,$note,$staff['id'],$id]);
    send_email($partner['email'],'Prism partner application update',"Hello,\n\nYour application for {$partner['business_name']} is now marked: $status.\n\nSign in at our official partner portal for details.\n\nPrism Travels");
    okay(['message'=>'Partner status updated.']);
}
if ($action === 'admin_offer') {
    partner_staff();
    $id=filter_var($data['id'] ?? null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
    $status=field($data,'status',16);
    if ($id===false || !in_array($status,['approved','rejected','pending'],true)) fail(422,'Invalid offering status.','INVALID_STATUS');
    $stmt=$db->prepare('SELECT o.id,p.status AS partner_status FROM prism_partner_offerings o JOIN prism_partners p ON p.id=o.partner_id WHERE o.id=?');$stmt->execute([$id]);$offer=$stmt->fetch();
    if (!$offer) fail(404,'Offering not found.','NOT_FOUND');
    if ($status==='approved' && $offer['partner_status']!=='approved') fail(422,'Approve the supplier first.','PARTNER_NOT_APPROVED');
    $db->prepare('UPDATE prism_partner_offerings SET status=? WHERE id=?')->execute([$status,$id]);
    okay(['message'=>'Offering status updated.']);
}
fail(400,'Unknown action.','BAD_ACTION');
