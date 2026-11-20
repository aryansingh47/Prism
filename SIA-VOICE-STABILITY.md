# SIA Voice — Member Access, Reliability & Cache Fix

This is a **follow-up to the Hostinger-only SIA Voice Pilot** already merged into Prism `main`. It does not install the earlier separate Node.js voice controller.

## Fixes

1. **All registered, verified Prism accounts** can start voice sessions. The `voice_pilot_emails` allowlist is no longer consulted. Guests / unverified users remain blocked by `require_user()`.
2. Replaces the earlier **3 starts/hour and 8 starts/day** rate limiter with **8/hour and 20/day by default**. Both windows use separate MySQL keys, so previous pilot test attempts do not carry over. Limits are based on **session starts**, not minutes or concurrent sessions.
3. Explicit `VOICE_START_LIMIT` errors show an approximate retry time and `Retry-After` response header. The server refunds only definite, non-rate-limit provider 4xx rejections. Provider 429s, 5xx errors, and ambiguous timeouts still count to prevent retry storms.
4. Removes the **VOICE PREVIEW · MEMBERS ONLY** label from the voice interface. The remaining usage notice accurately explains that no server-enforced monthly cap exists.
5. Adds a deterministic **HTML asset refresh** that installs the voice script and stylesheet as explicit versioned resources on all pages. This prevents the previous runtime loader from fetching an old `pilot-1` script, even when `porter-chatbot.js` was cached. Both scripts remain loaded in order, with no duplicate voice buttons.

## Apply the Git patch

From a clean working tree with the previous SIA Voice Pilot merged into `main`:

```bash
git switch main
git pull --ff-only origin main
git switch -c fix/sia-voice-member-access

git apply --check ~/Downloads/prism-sia-voice-stability-kit/sia-voice-stability.patch
git apply ~/Downloads/prism-sia-voice-stability-kit/sia-voice-stability.patch

python3 scripts/refresh_sia_voice_assets.py

git diff --check
node --check js/sia-voice-lite.js
php -l api/sia-voice-session.php
php -l api/sia-voice-rate.php
```

`git apply --check` must succeed before applying. Do not use `--reject` or `--force` on an unexpected branch.

The Python step is essential: it updates the actual `*.html` and `packages/*.html` files on your local branch with versioned CSS/JS tags. It is idempotent and prints how many pages it refreshed.

## Configure the private Hostinger file

The existing `prism-private/porter-config.php` stays outside `public_html` and outside Git. You may **delete `voice_pilot_emails`** because the voice endpoint ignores it.

```php
'voice_pilot_enabled' => true,
'openai_voice_model' => 'gpt-live-1.1',
// Optional: reuses openai_api_key if absent.
'openai_voice_api_key' => 'YOUR_API_KEY',
// Optional per-account start limits; capped in code to 12/hr and 30/day.
'voice_starts_per_hour' => 8,
'voice_starts_per_day' => 20,
```

Do not remove the text-chat model/key settings or share screenshots of real keys.

## Commit and deploy

After testing, stage only these files and the generated HTML changes:

```bash
git add api/sia-voice-session.php api/sia-voice-rate.php js/sia-voice-lite.js \
  scripts/refresh_sia_voice_assets.py SIA-VOICE-STABILITY.md
git add -- '*.html' 'packages/*.html'
git commit -m "fix(ai): Stabilize SIA voice access and asset loading"
git push -u origin HEAD
```

Make a Pull Request to `main`; your existing GitHub→Hostinger auto-deployment should publish it. Do not upload a second website ZIP. The private PHP configuration is changed separately in Hostinger.

## Acceptance tests

- Visit the website in both a normal Chrome window and Incognito. SIA must have one voice microphone control in its header, on the homepage **and** a package subpage.
- A **guest** cannot start voice. A **verified registered account** that was not on the old allowlist can start voice.
- Speak and hear an answer. End and start another call: the old 3/hour lockout should no longer occur.
- After hitting the new per-account limit, the API reports `VOICE_START_LIMIT`, HTTP 429 and a `Retry-After` header instead of a generic message.
- For an OpenAI-originated 429, the API reports `VOICE_PROVIDER_LIMIT` (different from Prism's local limit). Provider errors need investigation in the OpenAI project usage/billing dashboard.
- The normal text chatbot and enquiry flow still work.

## Production warning

This is still a **voice pilot without a server-enforced per-user time quota**. The browser stops the visible call after two minutes, but clients can modify that timer, and disconnected browsers do not necessarily end all upstream billing immediately. Session-start throttling is not a monthly usage cap. Opening access to every verified account increases potential API costs. Monitor spending, use a separate OpenAI project and maintain an incident kill switch (`voice_pilot_enabled => false`) that blocks **new** calls. Already-active calls are not forcibly disconnected by the flag.
