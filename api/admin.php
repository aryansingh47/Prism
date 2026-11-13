<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
$user=require_user();
if (!is_staff($user)) fail(403,'You do not have access to the staff enquiry desk.','FORBIDDEN');
$db=database();
if ($_SERVER['REQUEST_METHOD']==='GET') {
    $stmt=$db->query('SELECT id,first_name,last_name,email,phone,company,interest,departure_city,destination,start_date,end_date,flexible_dates,adults,children,budget,currency,accommodation,contact_method,message,status,created_at FROM enquiries ORDER BY created_at DESC LIMIT 100');
    okay(['enquiries'=>$stmt->fetchAll()]);
}
$data=input();csrf();
$id=filter_var($data['id']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1]]);
$status=field($data,'status',20);
if (!$id || !in_array($status,['new','contacted','closed'],true)) fail(422,'Invalid status update.','INVALID_UPDATE');
$db->prepare('UPDATE enquiries SET status=? WHERE id=?')->execute([$status,$id]);
okay(['message'=>'Enquiry status updated.']);
