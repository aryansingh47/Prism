# SIA Voice Pilot — Hostinger-only setup (no voice controller)

**Status: implementation for limited staging tests. Not a production monthly-quota release.**

This patch provides real-time, two-way speech using OpenAI GPT-Live 1.1 and WebRTC. A verified Prism account is required. A small invitation list in the server's private PHP config restricts access while the permanent five-minute monthly limit is postponed.

## What is — and isn't — included

- The existing SIA text chat and its OpenAI Terra connection remain unchanged.
- The voice model is `gpt-live-1.1`. It receives an approved snapshot of Prism's packages at call setup. **Voice is not yet delegated to Terra**; Terra still powers the separate text chat.
- The browser provides Start, End, microphone mute, speaker mute and best-effort captions.
- A browser timer ends the local call after **120 seconds**; it can be bypassed or interrupted and **does not hard-limit OpenAI billing**.
- **No five-minute monthly allowance is enforced**. The new server endpoint limits how frequently a user starts sessions (3/hour and 8/day), but that does not bound how long existing upstream sessions run or how much they cost.
- No persistent voice usage ledger, server-side hangup, or new VPS is included.
- **Do not apply the old `prism-sia-voice.patch` and this pilot patch together.** This is a replacement, intended for the green SIA `main` branch before the controller-based voice patch.

## Requirements

1. Existing Prism PHP/MySQL signup and email verification must already work.
2. Existing `/api/session.php` must return `{ "ok": true, "user": {...}, "csrf": "..." }` when a verified user is signed in.
3. Hostinger must have PHP 8.1+ and cURL enabled.
4. Your OpenAI API project must have billing and access to the `gpt-live-1.1` model.
5. The website must run over HTTPS, as microphone access requires a secure origin.
6. Set OpenAI project spending/alert controls and monitor usage during the pilot. A budget alert is not equivalent to a hard cost cap.

## Setup on Hostinger (private configuration only)

Inside the existing `prism-private/porter-config.php` PHP array, **add** these settings (do not replace the existing text-chat settings):

```php
'voice_pilot_enabled' => true,
'voice_pilot_emails' => [
    'YOUR_VERIFIED_TEST_ACCOUNT_EMAIL',
],
'openai_voice_model' => 'gpt-live-1.1',
// Optional. If omitted, uses the existing openai_api_key from this file.
'openai_voice_api_key' => 'YOUR_DEDICATED_OPENAI_API_KEY',
```

Only the listed verified accounts may start a voice session. Set `voice_pilot_enabled` to `false` to block new voice starts immediately. Disabling it does **not** forcibly close any already-connected OpenAI voice session.

The private file must remain **outside `public_html`**. Never put API keys in GitHub or a page script.

## Apply Git patch

From a clean Prism repository whose `main` contains the green SIA release and the revert of the flat/uniform button experiment:

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/sia-voice-pilot

git apply --check ~/Downloads/prism-sia-voice-pilot/prism-sia-voice-pilot.patch
git apply ~/Downloads/prism-sia-voice-pilot/prism-sia-voice-pilot.patch

git diff --check
node --check js/porter-chatbot.js
node --check js/sia-voice-lite.js
php -l api/sia-voice-session.php
```

Do not proceed with the `git apply` step if the check fails. If you previously applied the controller-based patch to this same branch, start from clean `main` instead.

## Test (recommended: Hostinger staging, NOT production)

1. Create or use a **verified, registered** Prism account whose email is on the `voice_pilot_emails` list.
2. Log into Prism. Confirm `api/session.php` says there is a user (keep the CSRF/session information private).
3. Open SIA. Click the microphone icon in the header.
4. Accept the voice/privacy notice, then press Start. Grant microphone access.
5. Speak naturally in English, Hindi or Hinglish. You should hear SIA's spoken response.
6. Test mute, unmute, speaker control, End, Back to chat and the local 2-minute preview timer.
7. Test while signed out; the backend must reject starting a voice call.
8. Test with another verified email not on the pilot allowlist; the backend must reject it.
9. Inspect the browser Network tab for `api/sia-voice-session.php` and check the JSON/HTTP status. Never share credentials.
10. Check OpenAI API usage for a genuine Live call.

When ready to merge:

```bash
git add js/porter-chatbot.js js/sia-voice-lite.js css/sia-voice-lite.css api/sia-voice-session.php SIA-VOICE-PILOT.md
git commit -m "feat(ai): Add signed-in SIA voice pilot without controller"
git push -u origin HEAD
```

Create a pull request and merge only after staging acceptance. GitHub `main` auto-deploys to Hostinger, so do not upload a separate website ZIP. The populated private PHP configuration is not part of Git and must be configured on Hostinger separately.

## Troubleshooting

- `VOICE_DISABLED`: `voice_pilot_enabled` missing or false.
- `VOICE_NOT_INVITED`: signed-in email is not in the pilot list.
- `LOGIN_REQUIRED`: sign in and verify email, then reload.
- `VOICE_PROVIDER_AUTH`: missing/invalid OpenAI permissions, key or billing project.
- `VOICE_PROVIDER_LIMIT`: rate limit, quota or billing issue at provider.
- `RATE_LIMIT`: too many starts according to Prism's database counter.
- WebRTC audio fails: try an HTTPS page in current Chrome/Safari; check mic permissions, browser Network console and whether the server can call OpenAI.
- `VOICE_CONFIG`: private key missing or PHP cURL unavailable.

## Security and later patch

Before removing the pilot allowlist and opening voice to all signed-up customers, deploy the server-managed quota/controller or a similarly enforceable solution. Add a **durable five-minute-per-user-per-month ledger**, overlapping-session prevention, provider-side session hangup, abuse monitoring, and agreed billing protections. Browser-only timers are inadequate for a hard cap.

No raw audio is intentionally stored by this app, but audio is transmitted to OpenAI to provide the voice service. Confirm the privacy notice and applicable supplier data terms before customer rollout.
