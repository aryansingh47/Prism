<?php
declare(strict_types=1);
require __DIR__.'/_bootstrap.php';
if ($_SERVER['REQUEST_METHOD']==='GET') {
    $user=require_user();
    $q=database()->prepare('SELECT id,interest,destination,departure_city,start_date,end_date,status,created_at FROM enquiries WHERE user_id=? ORDER BY created_at DESC LIMIT 30');
    $q->execute([$user['id']]);okay(['enquiries'=>$q->fetchAll()]);
}
$data=input();csrf();
rate_limit('enquiry',client_ip(),6,3600);
// Honeypot field is normally empty. Prevent bot spam without exposing responses.
if (!empty($data['website'])) okay(['message'=>'Thank you for your enquiry.']);
if (($data['consent'] ?? false)!==true) fail(422,'Please consent to the use of your contact details.','CONSENT_REQUIRED');
$first=field($data,'first_name',80);$last=field($data,'last_name',80);$email=email_field($data);
$phone=field($data,'phone',30);$company=field($data,'company',120);
$interest=field($data,'interest',60);$departure=field($data,'departure_city',100);$destination=field($data,'destination',160);
$allowed=['Personal holiday','Flights & hotels','Corporate travel','MICE / events','Destination wedding','Ground transport','Group travel','Travel advisory','Other / not sure'];
if (!$first || !$last || !in_array($interest,$allowed,true)) fail(422,'Name and a travel interest are required.','INVALID_FIELD');
$dates=[];
foreach (['start_date','end_date'] as $name) {
    $date=field($data,$name,10);
    if ($date!=='') {
        $obj=DateTimeImmutable::createFromFormat('!Y-m-d',$date);
        if (!$obj || $obj->format('Y-m-d')!==$date) fail(422,'Please enter valid travel dates.','INVALID_DATE');
    }
    $dates[$name]=$date ?: null;
}
if ($dates['start_date'] && $dates['end_date'] && $dates['end_date']<$dates['start_date']) fail(422,'Return date must be after departure.','INVALID_DATE');
$adults=filter_var($data['adults']??null,FILTER_VALIDATE_INT,['options'=>['min_range'=>1,'max_range'=>100]]);
$children=filter_var($data['children']??0,FILTER_VALIDATE_INT,['options'=>['min_range'=>0,'max_range'=>100]]);
if ($adults===false||$children===false) fail(422,'Enter a valid number of travellers.','INVALID_TRAVELLERS');
$budget=$data['budget']??null;
if ($budget === '') $budget = null;
if ($budget!==null && (!is_numeric($budget) || (float)$budget < 0 || (float)$budget >999999999)) fail(422,'Enter a valid budget.','INVALID_BUDGET');
$currency=field($data,'currency',4)?:'INR';
if (!in_array($currency,['INR','USD','GBP','EUR','AUD','NZD'],true)) fail(422,'Unsupported currency.','INVALID_CURRENCY');
$stay=field($data,'accommodation',40);$method=field($data,'contact_method',16);
if (!in_array($stay,['','Comfort / value','Premium','Luxury','Mixed','Not applicable'],true) || !in_array($method,['Email','Phone','WhatsApp'],true)) fail(422,'Select a valid preference.','INVALID_PREFERENCE');
$message=field($data,'message',4000);
if (mb_strlen($message)<10) fail(422,'Please describe your trip in at least 10 characters.','MESSAGE_REQUIRED');
$userId=(int)($_SESSION['user_id']??0) ?: null;
if ($userId) { $stmt=database()->prepare('SELECT id FROM users WHERE id=? AND verified_at IS NOT NULL');$stmt->execute([$userId]);if (!$stmt->fetch()) $userId=null; }
$stmt=database()->prepare('INSERT INTO enquiries (user_id,first_name,last_name,email,phone,company,interest,departure_city,destination,start_date,end_date,flexible_dates,adults,children,budget,currency,accommodation,contact_method,message,consent_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP())');
$stmt->execute([$userId,$first,$last,$email,$phone,$company,$interest,$departure,$destination,$dates['start_date'],$dates['end_date'],!empty($data['flexible_dates'])?1:0,$adults,$children,$budget,$currency,$stay,$method,$message]);
$id=(int)database()->lastInsertId();
$subject='New Prism travel enquiry #'.$id;
$body="Enquiry #$id\nName: $first $last\nEmail: $email\nPhone: $phone\nCompany: $company\nInterest: $interest\nFrom: $departure\nDestination: $destination\nDates: {$dates['start_date']} to {$dates['end_date']}\nAdults: $adults; Children: $children\nBudget: $currency $budget\nStay: $stay\nContact method: $method\nMessage:\n$message\n\nSee enquiry records in the restricted staff dashboard.";
$staffMailbox=(string)($config['notify_email']??'');
if (filter_var($staffMailbox,FILTER_VALIDATE_EMAIL)) send_email($staffMailbox,$subject,$body);
okay(['message'=>'Thank you. Your enquiry has been received by Prism Travels.','reference'=>'PRISM-'.str_pad((string)$id,6,'0',STR_PAD_LEFT)]);
