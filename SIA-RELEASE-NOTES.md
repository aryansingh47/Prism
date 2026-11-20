# SIA — Prism's Intelligent Travel Assistant

This is an **aesthetic and identity-only update** to the working Porter v2 chatbot. The API URL, model, database integration and private configuration are unchanged on purpose.

## Changes

- Renames the public-facing assistant to **SIA**, including the OpenAI assistant instructions and health-check service label.
- Replaces the launcher and chat-header avatar with the attached **transparent SIA character** (`assets/sia-avatar.png`).
- Moves the launcher and open chat panel to the **bottom-left**, leaving Prism's bottom-right **Enquire** button unobstructed when the chatbot is minimised.
- Updates the launcher, chat header, buttons, focus and accents to a **warm orange and cream** theme.
- Adds an **expand / restore** control (normal approximately 420 × 650px, expanded approximately 700 × 800px on desktop, limited by viewport).
- The existing minimise control returns to the launcher; reopening retains the expanded/normal preference during the page visit.
- Updates all 23 HTML pages to point to the SIA avatar and versioned CSS/JS URLs to avoid stale browser assets.

## Unchanged by design

- Internal filenames and PHP endpoint URLs remain `porter-*.php` for compatibility. The frontend now introduces SIA instead of Porter.
- **Do not rename `porter-config.php`**, the OpenAI project, rate-limit directory, or existing PHP functions. Your working API key and Terra model settings are unchanged.
- The existing Prism MySQL enquiry service remains in use.
- The original Porter image is left in place for rollback; the new interface doesn't reference it.

## Applying the patch

From the Prism repository root, with a clean working tree and `main` updated:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/sia-chatbot-rebrand
git apply --check ~/Downloads/prism-sia-update/prism-sia.patch
git apply ~/Downloads/prism-sia-update/prism-sia.patch
git diff --check
```

If `git apply --check` fails, **don't force it**; review the conflicting files before applying a fallback file-overwrite method.

## Local verification

```bash
node --check js/porter-chatbot.js
php -l api/porter-chat.php
php -l api/porter-bootstrap.php
php -l api/porter-health.php
php -S 127.0.0.1:8000
```

Browse `http://127.0.0.1:8000/` and verify:

1. **Ask SIA** launcher at bottom-left and **Enquire** remains bottom-right.
2. Clicking SIA opens one chat panel; the launcher disappears.
3. New SIA character is transparent and visible on launcher and header.
4. Orange visual theme is consistent across chat and enquiry views.
5. Maximise enlarges the panel; Restore returns to normal; Minimise closes it.
6. Submit a test travel question and confirm a genuine OpenAI response.
7. Check `packages/rajasthan.html` and a mobile viewport for image paths and layout.

## Commit and automatic Hostinger deployment

```bash
git add -A
git commit -m "feat(ai): Rebrand travel assistant as SIA and refine chat layout"
git push -u origin HEAD
```

Create a Pull Request into `main`. Once checks pass and it is approved, **merge the Pull Request**. With your GitHub→Hostinger automatic deployment enabled and targeting `main`, **do not upload the ZIP manually**. Wait for deployment confirmation and test `https://tripbyprism.co.in/`.

Your existing private `prism-private/porter-config.php` remains intact and **must not be committed or uploaded again** for this update.

To confirm the new server files landed, check `https://tripbyprism.co.in/api/porter-health.php` now reports `"service":"SIA"`. That is a version check, not proof of OpenAI connectivity; follow with a real SIA chat message and review the OpenAI usage dashboard.
