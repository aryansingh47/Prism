# Porter – Phase 1 Intelligent Travel Assistant

This update adds a site-wide AI chatbot named **Porter** to the Prism website.

## What this patch includes

- Floating chatbot launcher on all main pages and package sub-pages.
- Branded chat window using the supplied Porter character asset.
- AI-backed assistant endpoint (`api/porter-chat.php`) with:
  - OpenAI support via server-side API calls.
  - Safe fallback mode when an API key has not yet been configured.
  - Grounding on Prism package and destination knowledge.
- Enquiry capture endpoint (`api/porter-enquiry.php`) that:
  - Stores enquiries in `storage/porter-enquiries.jsonl`.
  - Attempts to notify the Prism team by email.
- Health check endpoint (`api/porter-health.php`).
- Config example at `setup/porter-config.example.php`.

## Before going live

1. Copy the example config:

   ```bash
   cp setup/porter-config.example.php setup/porter-config.php
   ```

2. Edit `setup/porter-config.php` and add:
   - the real OpenAI API key,
   - the notification email for your team,
   - the sender email you want to use.

3. Make sure PHP can write to the `storage/` directory.

4. Optional: point the notification email to a monitored inbox such as:
   - `reservations@tripbyprism.com`
   - `corporate@tripbyprism.co.in`

## Behaviour

- If an OpenAI API key is configured, Porter will use the OpenAI API.
- If no API key is configured, Porter still works in a controlled fallback mode using Prism's local package catalogue.
- Porter never confirms bookings or live availability.
- Pricing remains indicative.

## Quick smoke test

1. Open the website.
2. Click the **Chat with Porter** launcher.
3. Ask: `Show me your best winter packages`.
4. Submit an enquiry through the **Plan My Trip** tab.
5. Confirm that:
   - a reference number is returned,
   - the enquiry is appended to `storage/porter-enquiries.jsonl`,
   - the team email receives a notification (if mail is configured).

## API endpoints

- `api/porter-health.php`
- `api/porter-chat.php`
- `api/porter-enquiry.php`

## Notes

- This implementation is designed for Phase 1 and is intentionally safe, branded and Hostinger-friendly.
- The architecture keeps the AI key on the server.
- The UI is independent of the rest of the site and can be extended later with:
  - authenticated user context,
  - real supplier APIs,
  - richer package comparison,
  - analytics.

## Security and deployment cautions

- Do not deploy Porter publicly until you have configured rate limits, verified data protection measures, and tested the full workflow. The provided PHP endpoints are an implementation starter, not a substitute for security review.
- Never commit `setup/porter-config.php`; the `setup/.gitignore` covers it.
- Keep actual enquiry records **outside `public_html`** by setting `enquiry_storage` to a private absolute path. The included `storage/.htaccess` is an additional Apache/LiteSpeed safeguard, not a substitute for private storage.
- The notification uses PHP `mail()` and may not reliably deliver on every Hostinger plan. For dependable alerts, integrate authenticated SMTP or reuse Prism's approved PHPMailer mail service.
- Test the current Hostinger runtime, API key, alerts, spam/rate limiting, privacy consent, and submission/storage permissions before launch.
- For a production system, prefer the existing Prism enquiry database instead of maintaining a second unconnected file-based store.
