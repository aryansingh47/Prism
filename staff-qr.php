<?php
declare(strict_types=1);
require __DIR__ . '/api/_bootstrap.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') fail(405, 'Method not allowed.');
$user = require_user();
if (!is_staff($user)) fail(403, 'Staff access required.');
header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header("Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self' blob:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
function qr_html(string $value): string { return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
?>
<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Employee QR Generator | Prism</title>
  <link rel="icon" href="assets/favicon-64.png">
  <link rel="stylesheet" href="css/prism-employee-qr.css">
  <script src="js/vendor/prism-qr-encoder.js" defer></script>
  <script src="js/prism-employee-qr.js" defer></script>
</head>
<body>
  <header class="qr-header"><div class="qr-shell qr-header-inner">
    <a href="staff.html" class="qr-brand"><img src="assets/prism-mark.png" alt="" width="48" height="48"><span><strong>PRISM</strong><small>TRAVEL &amp; ADVISORY</small></span></a>
    <a class="qr-back" href="staff.html">Back to Staff Portal</a>
  </div></header>
  <main class="qr-shell">
    <div class="qr-heading"><p class="qr-eyebrow">STAFF TOOLS</p><h1>Employee QR Generator</h1><p>Create a digital contact card for a printed business card.</p></div>
    <div class="qr-layout">
      <section class="qr-panel" aria-labelledby="details-title">
        <h2 id="details-title">Contact details</h2><p class="qr-muted">Your account details are pre-filled. Edit them to prepare a card for another approved employee.</p>
        <form id="employee-qr-form" autocomplete="off">
          <div class="qr-fields">
            <label>First name <input name="first" required maxlength="50" value="<?= qr_html((string)$user['first_name']) ?>"></label>
            <label>Last name <input name="last" required maxlength="50" value="<?= qr_html((string)$user['last_name']) ?>"></label>
            <label class="qr-wide">Designation <input name="title" required maxlength="70" placeholder="e.g. Technology Lead"></label>
            <label>Work mobile <input name="phone" type="tel" required maxlength="24" placeholder="+91 98765 43210"></label>
            <label>Work email <input name="email" type="email" required maxlength="100" value="<?= qr_html((string)$user['email']) ?>"></label>
            <label class="qr-wide">Company <input name="company" readonly value="Prism Travel and Advisory Limited"></label>
            <label class="qr-wide">Website <input name="website" readonly value="https://tripbyprism.co.in"></label>
          </div>
          <label class="qr-check"><input type="checkbox" name="address" checked> Include head office address</label>
          <p class="qr-muted qr-address">HSIIDC IT Park, Sector-22, Panchkula, Haryana 134109, India</p>
          <details><summary>Optional social links</summary><p class="qr-muted">Some contact apps retain only one website URL. Adding links also increases QR density.</p>
            <div class="qr-fields"><label class="qr-wide">Social URL 1 <input type="url" name="social1" maxlength="150" placeholder="https://..."></label><label class="qr-wide">Social URL 2 <input type="url" name="social2" maxlength="150" placeholder="https://..."></label></div>
          </details>
          <label class="qr-check"><input type="checkbox" name="approved" required> I confirm these details are approved for public distribution.</label>
          <div class="qr-actions"><button type="submit">Generate QR code</button><button type="reset" class="qr-secondary">Reset</button></div>
          <p id="qr-status" role="status" aria-live="polite"></p>
        </form>
      </section>
      <section class="qr-panel qr-output" aria-labelledby="preview-title">
        <h2 id="preview-title">Preview &amp; export</h2>
        <p id="qr-placeholder" class="qr-placeholder">Enter the employee details to generate a QR code.</p>
        <div id="qr-result" hidden>
          <img id="qr-image" alt="Employee contact QR code" width="320" height="320">
          <p class="qr-caption">Scan to Save Contact</p><p id="qr-employee" class="qr-muted"></p>
          <p id="qr-print-size" class="qr-muted"></p>
          <div class="qr-actions qr-downloads"><button type="button" data-export="svg">SVG</button><button type="button" data-export="png">PNG</button><button type="button" data-export="vcf">vCard</button></div>
        </div>
        <p class="qr-muted">Static contact QR codes work offline on compatible scanners. Updating printed details requires generating and printing a new code. Test on iPhone and Android before printing.</p>
      </section>
    </div>
    <noscript>JavaScript is required to generate and export QR codes.</noscript>
  </main>
</body></html>
