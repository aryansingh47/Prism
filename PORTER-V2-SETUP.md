# Porter v2 — AI connection, design and customer enquiry release

**Prism Travel and Advisory Limited · 20 November 2026**

This is a targeted replacement of the previous Porter Phase 1 chat implementation. The website's other content and destination pages do not need changing.

## 1. What changed

- **Real model calls:** OpenAI **Responses API** with `gpt-6.1-terra` by default. There are **no hidden canned answers** on API failure. A useful error code is displayed and recorded in the server log.
- **Professional interface:** One compact launcher, no duplicate button when open, no demo badge, clean avatar without a translucent tile, consistent SVG icons, mobile sizing, readable cards, unobtrusive prompts that disappear when the conversation starts.
- **Better grounding:** All 17 approved package records are sent as bounded source context to the model. Recommends only real itineraries and links to the correct destination subpages. Rates remain indicative.
- **One enquiry record system:** "Plan an enquiry" now uses Prism's existing `api/session.php` and `api/enquiries.php`, therefore **MySQL and configured SMTP** must work on Hostinger. The old independent JSON file endpoint is retired (`410 Gone`).
- **Security:** Private credentials outside the public web root, input limits, origin checks, per-IP throttling, HTTPS requirement at production hosting, and browser chat history kept only in memory (not persisted in localStorage).

## 2. Apply to local repository

Create a dedicated branch from the `main` containing the original Porter patch:

```bash
git status --short
git switch main
git pull --ff-only origin main
git switch -c fix/porter-live-ai-interface
```

Extract `prism-porter-v2-kit.zip` into Downloads, then from the Prism repository root:

```bash
git apply --check ~/Downloads/prism-porter-v2-kit/prism-porter-v2.patch
git apply ~/Downloads/prism-porter-v2-kit/prism-porter-v2.patch
git diff --check
```

**Never run `git apply --reject` or `--force`.** If `--check` fails, stop and reconcile with your exact working tree.

## 3. Configure OpenAI

1. In <https://platform.openai.com/>, select or create the **Prism Travels — Porter** API project.
2. Add a billing method/credits. Note that ChatGPT subscriptions are **not** API credits.
3. In **Project settings → Limits**, verify the model `gpt-6.1-terra` is available and configure suitable project budget alerts and rate limits. Alerts are not a guaranteed hard cap.
4. In **API Keys**, create a **project-scoped key** named `porter-hostinger`. Grant the permissions needed for Responses API calls. Copy the key to a password manager immediately; never commit it or send it through chat.
5. Set up the following **private** file:

```bash
# Run from local Prism repo root
mkdir -p ../prism-private
cp setup/porter-config.example.php ../prism-private/porter-config.php
chmod 700 ../prism-private
chmod 600 ../prism-private/porter-config.php
```

Edit `../prism-private/porter-config.php`, replacing the placeholder with your actual API key. The **exact model ID is `gpt-6.1-terra`**. The file must live **outside** `public_html`, not under `public_html/setup/`.

If you previously put secrets into `setup/porter-config.php`, remove that populated copy from the server's `public_html/setup/`, rotate the exposed key if the directory was publicly reachable, and keep only `setup/porter-config.example.php` in GitHub.

### Expected private file

```php
<?php
return [
    'openai_api_key' => 'sk-PASTE_REAL_KEY_HERE',
    'openai_model' => 'gpt-6.1-terra',
    'reasoning_effort' => 'low',
    'max_output_tokens' => 1050,
    'openai_timeout_seconds' => 35,
    'rate_limit_per_10min' => 15,
    'max_history_messages' => 10,
];
```

Do not paste real credentials in an Issue, PR, terminal screenshot or documentation.

**Path behaviour:** `api/porter-bootstrap.php` looks for `../prism-private/porter-config.php` relative to the website root. If your Hostinger file tree differs, set environment variable `PRISM_PRIVATE_DIR` or `PORTER_CONFIG_PATH` in the PHP hosting environment; do not hardcode a secret path in public client JavaScript.

## 4. Verify your PHP environment

Use PHP 8.2+ and enable **cURL, mbstring and JSON**.

From the repo root:

```bash
php -v
php -m | grep -Ei 'curl|mbstring'
php tools/porter-diagnose.php
php tools/porter-diagnose.php --live
```

`--live` makes **one actual billable call** to OpenAI and reports HTTP status, model answer and token counts. It never prints the API key. If this succeeds, API usage should eventually appear under the **same API organisation and project**, with appropriate time filters.

Common errors:

| Code | Meaning | Fix |
| --- | --- | --- |
| `NOT_CONFIGURED` | Missing/unreadable real private config or cURL | Check file location, key, PHP extensions |
| `OPENAI_AUTH` | Invalid API key / insufficient permission | Create a correctly scoped project key |
| `OPENAI_QUOTA` | Credits, budget or project rate limit | Check billing, project limits and usage |
| `OPENAI_MODEL` | Model not available or incorrect ID | Use exactly `gpt-6.1-terra`, check model access |
| `UPSTREAM_NETWORK` | PHP server cannot reach OpenAI | Check Hostinger outbound HTTPS/cURL/firewall |
| `OPENAI_EMPTY` | Model returned no readable message | Retry; inspect server logs |
| `RATE_LIMIT` | Porter local per-IP throttling | Wait for ten-minute window |
| `SECURITY_STORAGE` | Private rate-limit directory not writable | Fix permissions on private directory |

**Reminder:** `api/porter-health.php` reports whether a key *appears configured*; it cannot validate the key. Only `--live` or a successful chat response can prove a real OpenAI call.

## 5. Local end-to-end staging

Run from the Prism repo root:

```bash
php -S 127.0.0.1:8000
```

Open `http://127.0.0.1:8000/index.html` and click **Ask Porter**. Test:

1. Ask “Compare Jaipur and Munnar for two adults in December.” Confirm coherent, bespoke advice and the accurate published indicative rates.
2. Ask about an unavailable real-time room booking. Porter must not fabricate availability.
3. Ask in Hindi or Hinglish.
4. Confirm the launch button disappears when the panel opens; close restores it.
5. Confirm starter prompts disappear after the **first sent message**.
6. Open **Plan an enquiry** and try a **synthetic test submission**. This requires the **existing Prism MySQL platform** and `api/session.php`/`api/enquiries.php` configured locally; otherwise you should see a clear failure. Do not send live customer details into an unverified environment.
7. Check all links on a destination subpage such as `packages/rajasthan.html`.

## 6. Hostinger staging then production

1. Back up `public_html` and `prism-private/` (including database backup through Hostinger/phpMyAdmin).
2. Create or use a password-restricted staging site with PHP support. Upload the changed files from `hostinger-changed-files.zip` preserving paths. **Do not delete** your other website files.
3. Put your **private** `porter-config.php` in the sibling `prism-private/` for that site. Do not upload the populated secret file into `public_html`.
4. Verify `https://STAGING-DOMAIN/api/porter-health.php` returns `ready: true`.
5. Test a real question and check the server log and OpenAI usage; also test an invalid key in staging, which should produce `OPENAI_AUTH`, not a canned answer.
6. Verify the existing `api/session.php` and `api/enquiries.php` work for a guest. Check that a synthetic test enquiry appears in `staff.html` and the configured SMTP notification reaches the company mailbox.
7. Run desktop/mobile and keyboard checks, confirm privacy notice is accurate, test the rate limit, and obtain approval.
8. Merge reviewed branch into `main`. Upload the changed files to production Hostinger `public_html` (or use your actual CI/CD integration if one exists), and deploy a production private config.
9. Repeat a real chat and synthetic enquiry check on the production domain. Then verify usage is recorded under Prism's OpenAI project.

**Crucial:** GitHub main branch deployment alone does not normally upload your PHP changes or private configuration to Hostinger.

## 7. Files included in patch

- `api/porter-bootstrap.php` — private config, security, rate limiter and catalogue retrieval
- `api/porter-chat.php` — actual Responses API call, error handling and model grounding
- `api/porter-health.php` — configuration readiness without exposing secrets
- `api/porter-enquiry.php` — disables the old insecure duplicate JSON workflow
- `css/porter-chatbot.css` — fully restyled UI
- `js/porter-chatbot.js` — new widget interactions + existing MySQL enquiry API
- `privacy.html` — explanation of AI message processing
- `setup/porter-config.example.php` — updated safe template
- `tools/porter-diagnose.php` — CLI configuration + real-call test

## 8. Notes and limitations

- I could test code syntax, HTTP error contracts and patch application, but **could not perform a genuine OpenAI request** without access to Prism's private API key. The final end-to-end AI acceptance check must be performed on Hostinger.
- Browsers keep only the **current page's** chat conversation in memory; reloading the page starts a new conversation. This minimises accidental persistence of personal messages.
- `porter-enquiry.php` no longer accepts submissions. Historical JSON enquiries from the old version are not automatically migrated. If any actual customers used it, export/reconcile the old private records securely before retiring them.
- This is a customer-facing assistant **for enquiry-led travel**, not a live booking engine. It does not access hotel/flight supplier APIs.
- For reliable enquiry notifications, SMTP must already be configured in Prism's main PHP/MySQL backend using PHPMailer. Porter reuses that service and does not send unauthenticated `mail()` messages.
