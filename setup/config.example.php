<?php
// IMPORTANT: COPY this file to "prism-private/config.php" NEXT TO public_html,
// not inside public_html, and never commit real passwords to GitHub.
return [
    'app_url' => 'https://tripbyprism.co.in',
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'uXXXXXXXX_prism',
        'user' => 'uXXXXXXXX_prism_user',
        'password' => 'REPLACE_WITH_HOSTINGER_DATABASE_PASSWORD',
    ],
    'rate_secret' => 'REPLACE_WITH_A_RANDOM_SECRET_AT_LEAST_32_CHARACTERS',
    'smtp' => [
        'host' => 'smtp.hostinger.com',
        'port' => 465,
        'user' => 'YOUR_ACTUAL_COMPANY_EMAIL@tripbyprism.co.in',
        'password' => 'REPLACE_WITH_MAILBOX_PASSWORD',
        'from' => 'YOUR_ACTUAL_COMPANY_EMAIL@tripbyprism.co.in',
    ],
    // Only VERIFIED accounts with one of these addresses can access staff.html:
    'staff_emails' => ['YOUR_ACTUAL_COMPANY_EMAIL@tripbyprism.co.in'],
    'notify_email' => 'YOUR_ACTUAL_COMPANY_EMAIL@tripbyprism.co.in',
];
