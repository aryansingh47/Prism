# Employee QR generator

## Purpose

Staff-only utility for generating static vCard 3.0 contact QR codes for printed employee business cards. It uses the existing `api/_bootstrap.php` helpers `require_user()`, `is_staff()` and `fail()` and the verified staff email allowlist. No new database table, configuration secret, server dependency or external QR service is needed. The QR encoder is bundled locally; see `employee-qr-third-party.txt` for attribution and licensing.

## Installation

Create a GitHub issue, update `main`, and create `feature/<issue>-employee-qr-generator`. From the repository root, check and apply the supplied patch using `git apply --check` and `git apply`. Never force-apply. Stage only the files listed in the patch; inspect `git diff --cached --check` and `git diff --cached --stat`. Run `node tests/employee-qr.test.cjs`, `php -l staff-qr.php` and `node --check js/prism-portal.js`. Submit a reviewed pull request with test results and deployment/rollback evidence.

If the dashboard JavaScript has changed since the baseline and the full patch fails, the additive-only patch adds the generator and tests without touching that script. In that case, manually add an anchor with `href="staff-qr.php"` and text `Employee QR Generator` to the existing staff tools, showing it only after the server session confirms staff access. The PHP page itself enforces access even if someone enters the URL directly. Do not replace the current portal script wholesale. If the PHP authentication helper signatures have changed, adapt the new PHP page to the current server-side staff authorization before deploying.

Deploy on the existing Hostinger PHP hosting; GitHub Pages cannot execute `staff-qr.php`. No Composer install, npm install or migration is needed. If automatic deployment is disabled, deploy the changed files through the established release process.

## Acceptance tests on Hostinger

1. Open `staff-qr.php` in a private window: expect HTTP 401 or equivalent existing login-required response. Sign in as a verified non-staff member: expect HTTP 403. Authorised verified staff should get HTTP 200. Verify that the staff dashboard shows the new link only after staff session validation. Check that existing enquiries still load and can be updated.
2. Check names and email are pre-filled from the signed-in account. Enter employee-approved public business details. Confirm the approval checkbox; invalid numbers, invalid emails and unsafe social URLs should be rejected. Editing a field invalidates the old preview. Reset clears the preview.
3. Generate and download SVG, PNG and VCF. Open the VCF on a phone. Scan the QR with the native iPhone Camera and Android Camera or Google Lens; verify name, organisation, title, work telephone, email, website and address. Optional extra URLs may be ignored by native contacts apps. A scanner may require an extra tap or not recognise vCard directly; a universal automatic native contact editor is not guaranteed.
4. Test a second employee and international/Unicode names. Check the QR in an actual print proof at its recommended width, with the four-module white border intact, on both devices. If a scanner struggles, omit optional address/social links or enlarge the code. Use SVG for the printer.
5. In developer tools confirm no employee details are sent to the server or a third-party service during generation and export. The account profile is served only to authenticated staff. No employee data is written by this feature to MySQL, localStorage or analytics. Downloaded cards remain on the workstation; handle those files appropriately.

## Rollback

Revert the feature commit or merged PR using GitHub's revert mechanism (or `git revert` of the appropriate commit), review and redeploy. There is no database rollback. Previously printed static QR codes remain readable and cannot be remotely revoked. Reprint cards after details change or employees leave.
