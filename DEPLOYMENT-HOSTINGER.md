# Prism Travels — first-party enquiries and accounts

> This feature update requires a PHP/MySQL server. **GitHub Pages will display the HTML but cannot run the enquiry, sign-up, login or staff APIs.** Publish the changed site on Hostinger's **Custom PHP/HTML hosting**, not GitHub Pages, after completing the steps below.

## Included features

- The **exact attached transparent Prism PNG** (`assets/prism-mark.png`) replaces the prior header/footer marks. Favicon, touch icon and `og:image` are derived from it.
- **Head office**: HSIIDC IT Park, Sector-22, Panchkula, Haryana – 134109, India; shown on the Contact page and in each page's footer. The previously supplied Kala Amb address is retained as the **principal place of business**.
- Every enquiry link leads to `contact.html#enquiry-form` instead of an embedded Google iframe.
- Native styled enquiry form with server-side validation, database storage, email notifications (when SMTP is configured), guest enquiries and a reference number.
- Verified customer accounts: registration, email verification, login, logout, password reset and saved enquiry history. **Guest mode requires no account.** Enquiries made before signing in are not automatically linked to a later account.
- `staff.html` is a **private staff dashboard**; the server only returns records to verified accounts listed in `staff_emails`.

## IMPORTANT — Google Form question parity

The existing Google Form could not be accessed for question-by-question inspection during this build. The form reproduces the *known* core enquiry fields shown in the supplied SITA reference (first name, last name, email, company, area of interest, message), and adds travel-specific fields appropriate for Prism. **It is not verified to match every question on your current Google Form.** Before going live, compare each field and its options with the current Google Form and edit `contact.html`, `js/prism-portal.js` (if names change), `api/enquiries.php` and `database/schema.sql` (if new persistent fields are added). Do not tell customers that the form is identical until this review is done.

### Fields in the new form

| Type | Fields |
| --- | --- |
| Contact | First name*, last name*, email*, telephone/WhatsApp, company |
| Enquiry | Interested in*, departure city, destination(s), departure date, return date, flexible dates, adult count*, child count |
| Preferences | Total budget, currency, accommodation preference, preferred contact method |
| Details | Trip message*, explicit privacy consent* |

`*` Required. A hidden honeypot input is used to deter automated form spam.

## Apply patch (do not overwrite the entire project)

1. Download and unzip `prism-platform-update.zip` **outside** the repository.
2. In your existing clone of `aryansingh47/Prism` (the directory containing `index.html`, `css/` and `js/`):

```bash
git checkout main
git pull origin main
git checkout -b feature/prism-customer-platform
git apply --check /path/to/prism-platform-update/prism-platform.patch
git apply /path/to/prism-platform-update/prism-platform.patch
```

3. **Only if the check succeeds**, apply. If the check fails, stop; the repository may differ from the earlier November patches. Do not force-apply to production.
4. Inspect changes: `git diff --stat`, `git diff --check`; check that no secrets are present.

## Hostinger server setup

### 1. Check your hosting platform

- In hPanel: **Websites → Manage site → PHP Configuration**. Use **PHP 8.1+**, preferably a supported modern version (8.2/8.3/8.4), with PDO MySQL, mbstring and OpenSSL extensions enabled.
- Use **Custom PHP/HTML hosting**. Hostinger's AI Website Builder and GitHub Pages do not execute this PHP application.
- Make sure `https://tripbyprism.co.in` works with HTTPS before enabling account creation.

### 2. Create the MySQL database

In hPanel open **Databases → Management**. Create one database and database user; copy their actual names (Hostinger typically adds your account prefix), and set a strong password. Open **phpMyAdmin**, select this database and import `database/schema.sql` from this kit. Verify that `users`, `email_tokens`, `enquiries` and `rate_limits` exist.

### 3. Create a PRIVATE configuration file outside the web root

Your hosting layout should resemble:

```text
.../domains/tripbyprism.co.in/
├── prism-private/
│   └── config.php                  ← SECRET; never upload publicly or commit
└── public_html/
    ├── index.html
    ├── contact.html
    ├── account.html
    ├── staff.html
    ├── api/
    ├── css/
    ├── js/
    ├── assets/
    └── vendor/
```

Create `prism-private/` **as a sibling of** `public_html`. Copy `setup/config.example.php` into that folder and rename it to `config.php`. Fill in actual DB credentials and Hostinger email credentials. Set `staff_emails` and `notify_email` to the actual company mailbox you created. Generate `rate_secret` locally with:

```bash
php -r 'echo bin2hex(random_bytes(32)), PHP_EOL;'
```

Paste that output as `rate_secret`. Never publish this private file to GitHub or inside `public_html`. `api/_bootstrap.php` reads it using a filesystem path outside the public site.

### 4. Install PHPMailer

PHPMailer handles secure SMTP notifications, verification emails and password resets. From the repository on your Mac (with PHP and Composer installed):

```bash
composer install --no-dev --optimize-autoloader
```

Upload the generated `vendor/` directory with the PHP files. You can also run Composer via Hostinger SSH if available. The *patch does not bundle vendor packages*. Do not enable accounts until `vendor/autoload.php` exists and SMTP is configured.

Hostinger Email SMTP settings: `smtp.hostinger.com`, port `465` (SSL); fallback `587` (STARTTLS). In the private config, use the **mailbox address and mailbox password**, not the Hostinger account password. Confirm SPF/DKIM from your email settings for deliverability.

### 5. Deploy only web files to public_html

Upload the updated root HTML pages, `css/`, `js/`, `assets/`, `api/`, and `vendor/` to `public_html` (preserving directory structure). **Do not upload** `database/`, `setup/`, `.git/`, `scripts/`, `DEPLOYMENT-HOSTINGER.md`, personal screenshots, local backups, or your private configuration there. Replace existing files only after making a Hostinger backup.

If using Git on Hostinger, make sure `vendor/` is present (either uploaded or installed on the server), and separately maintain `prism-private/config.php` outside the Git checkout.

### 6. Verify each flow BEFORE publicly advertising the new accounts

1. Open `https://tripbyprism.co.in/api/session.php` — expect a JSON response with `"ok":true`, `"user":null` and a CSRF token. If 503, check the config path/DB credentials.
2. Visit `contact.html#enquiry-form`; submit a **guest** test enquiry. Confirm a `PRISM-000001`-style reference appears and a row exists in the database. Check whether an alert reaches your company mailbox; the database record is authoritative even if email delivery fails.
3. Create a test user on `account.html`, click the verification link received by email, log in, then submit another enquiry. Verify it appears in that user's account history.
4. Verify a password-reset link, logout, login with incorrect credentials, and a guest enquiry without signing in.
5. Register and verify the address listed in `staff_emails`, then open `staff.html`; confirm it shows enquiries and can update statuses. Sign in as a non-staff user and confirm the API denies access (403).
6. Check layout on desktop and mobile, the updated transparent logo and favicon, and confirm old buttons go to the native form.
7. Check browser Network/Console and Hostinger error logs for real PHP failures.

**Data handling:** This site now collects customer personal data. Review your privacy notice, retention policy, mail permissions and applicable Indian data-protection requirements with your legal/compliance lead before enabling real customer accounts. Set up database backups and appropriate staff access. Do not store passport scans or payment card information through the public form.

## Safety and platform limits

- Passwords are hashed with PHP `password_hash`, never stored in plaintext. Email verification and reset use one-time hashed tokens. PHP sessions use HttpOnly/SameSite cookies with Secure on HTTPS. Requests use CSRF tokens, server-side validation, prepared SQL and rate limiting.
- All staff endpoints check verified account status and a private server-side email allowlist.
- The form does **not** make bookings, take payments or check real-time travel prices.
- The login/signup endpoints **require** functioning SMTP and a real MySQL database; static hosting cannot support them.
- **Not all flows could be tested end-to-end in this offline environment**: the server's MySQL/SMTP credentials were not available. Test on a staging copy and take a backup before deploying to the live domain.

## Future maintenance

- Remove expired reset/verification tokens and old rate-limit rows periodically from a secure server cron job:

```sql
DELETE FROM email_tokens WHERE expires_at < UTC_TIMESTAMP();
DELETE FROM rate_limits WHERE window_end < UTC_TIMESTAMP() - INTERVAL 1 DAY;
```

- Rotate leaked secrets; update Composer dependencies regularly; patch PHP and review access logs.
- The original `scripts/build_pages.py` predates these changes and **will overwrite new HTML if run**. Stop using it until you've updated its templates.
