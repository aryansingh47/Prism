# PRISM | Website Usability Study

**Research kit · Version 1.0 · Prepared 21 November 2026 · Status: ready for internal review, not yet field-validated**

A complete, GitHub-ready usability research kit for **PRISM Travel and Advisory Limited**, trading as **TRIP by PRISM**. It combines moderated task-based usability testing with the **System Usability Scale (SUS)**, structured observation, privacy-conscious participant handling, reproducible scoring, and issue triage.

> **Publication:** This package contains reusable study templates and code. Obtain PRISM organisational approval before publishing any internal research materials or findings to a public repository.

> **Scope and limitations:** The public website could not be independently inspected during document preparation. Its exact build, live navigation, package inventory, and availability of SIA/voice must be checked before launch. The protocol deliberately tests user goals rather than relying on unverified labels or features. This package contains **no real participant results** and **no live Google Form URL**. The included Google Apps Script creates the forms in an account you control.

## Contents

| File | Use | Audience |
| --- | --- | --- |
| `docs/01-study-protocol.md` | Research objectives, methods, recruitment, metrics, risk controls | Research lead |
| `docs/02-participant-information-consent.md` | Information sheet, consent text, withdrawal procedure | Participants and organiser |
| `docs/03-recruitment-screening.md` | Screening and invitations | Organiser |
| `docs/04-participant-tasks.md` | Neutral, participant-facing task cards (T01–T06) | Participants |
| `docs/05-facilitator-script.md` | Verbatim moderator script and prompts | Facilitator |
| `docs/06-observer-guide.md` | Start/stop rules, hints, observation codes | Observer |
| `docs/07-form-blueprint.md` | Exact questions, question types and settings | Form owner |
| `docs/08-scoring-analysis.md` | SUS formula, analysis, success criteria | Analyst |
| `docs/09-report-template.md` | Ready-to-fill research report | Product team |
| `docs/10-issue-triage.md` | Severity ratings, GitHub issue template | Engineering team |
| `docs/11-launch-checklist.md` | Quality assurance before, during, after the study | Research lead |
| `docs/12-communications.md` | Email, WhatsApp and debrief drafts | Organiser |
| `docs/13-optional-sia-module.md` | SIA text and voice tests conducted separately | Research lead |
| `forms/create_prism_forms.gs` | Google Apps Script creates consent and SUS forms + private response sheets | Google account owner |
| `forms/SETUP.md` | Step-by-step Google Form setup and private data export | Google account owner |
| `templates/sus_responses.csv` | Empty normalized SUS responses | Analyst |
| `templates/task_observations.csv` | Empty task observations table | Observer |
| `templates/issues.csv` | Empty consolidated issue log | Product team |
| `templates/session_metadata.csv` | Empty session/environment register | Organiser |
| `analysis/analyse_sus.py` | Standard SUS scoring + task summary + optional JSON report | Analyst |
| `tests/test_analyse_sus.py` | Scoring regression tests, using fictional values | Engineering |
| `printables/*.pdf` | Print-ready participant and researcher handouts | On-site team |

## Adding this package to GitHub

**If PRISM already has a website code repository**, upload this **entire folder** under a path such as `research/usability/` so it does not overwrite the website's existing `README.md`, `.gitignore`, or `.github` configuration. Navigate into that folder before using the commands below. The nested `.github/` sample issue/workflow files remain reference templates in that case; only place them at the **repository root** (and adjust workflow paths) if you explicitly want GitHub to activate them.

For a **dedicated research repository**, place the *contents* of this folder at its root. Raw participant data must never be uploaded to either repository.

## Quick start

1. **Preflight the website** using `docs/11-launch-checklist.md`; record the deployed URL, version/commit, language, booking capabilities and SIA availability. Freeze the version for the testing round.
2. Select **one primary device cohort** per round (e.g. desktop browser), or record desktop and mobile as distinct analysis groups. Recruit 12–16 adult, first-time or infrequent visitors if feasible; an initial diagnostic pilot may be smaller.
3. Read `forms/SETUP.md`; run the script **in your own Google account**. It creates separate consent and post-session SUS forms and private linked spreadsheets. Check each form before distributing.
4. Pilot with 1–2 participants; fix misleading instructions, adjust the **protocol for everyone before the main round**, and ensure tasks actually exist in the deployed build.
5. Run sessions using `docs/05-facilitator-script.md`. Give `docs/04-participant-tasks.md` to participants. An observer logs T01–T06, timing, help and errors separately.
6. Administer **all ten SUS questions immediately after core tasks**, independently, before open-ended discussion. Keep SIA as a **separate, optional module after the SUS** unless every participant tests the same feature scope.
7. Export the private Google Sheet responses into `templates/sus_responses.csv` format, and run:

   ```bash
   python3 analysis/analyse_sus.py --sus /path/to/sus_responses.csv --tasks /path/to/task_observations.csv --json /path/to/private-summary.json
   python3 -m unittest discover -s tests -v
   ```

8. Synthesize observations and recommendations in `docs/09-report-template.md`; create prioritised engineering issues. Publish only suitably aggregated, de-identified findings.

## What is being evaluated?

Core round: ability to understand PRISM's offering, discover leisure-trip options, find the next step for a trip enquiry, locate corporate travel help, reach support, and plan a multi-service travel request **without entering private payment or identification details**. No real customer booking, payment, staff login, or production message is required.

Optional rounds: SIA text/voice, mobile-specific accessibility, checkout/OTA once genuinely implemented, and authenticated staff workflows **with dedicated permission and test accounts**. These are not silently mixed with the core SUS population.

## Research and privacy guardrails

- Do **not** commit raw Google Form exports, recordings, names, email addresses, identifying quotations, private response links, credential files, or consent records to GitHub.
- Keep the two response spreadsheets **private** and restrict access. Use participant IDs (P001, P002...) and a private, separate consent-code register only if needed for withdrawal.
- Recruitment and consent must be voluntary. Do not ask for passport data, financial details, traveller identities, or passwords. Stop at the point where a real booking or live enquiry would be submitted.
- One SUS score is **0–100 but is not a percentage**. The mean is a subjective summary, not a pass/fail certification. Small-sample findings should be expressed with appropriate uncertainty.
- Remove or anonymise identifying comments before sharing study materials. Confirm the company's actual privacy notice, contact address, lawful basis, retention policy and owner before inviting participants.

## Source notes

Adapted structurally from the author's earlier university task-based usability test (plan, participant form, SUS scoring, timing, severity rubric, and results discussion) but **none of its livestock-study text or old participant responses is reused as PRISM findings**.

- Brooke, J. (1996), *SUS: A “Quick and Dirty” Usability Scale*: https://doi.org/10.1201/9781498710411
- SUS item wording and scoring: https://openscales.net/scale.php?code=SUS
- SUS scoring reference: https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%255B1%255D.pdf
- Nielsen Norman Group, severity ratings: https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/
- Google Apps Script Forms reference: https://developers.google.com/apps-script/reference/forms

**Document owner:** PRISM research/product team (assign before launch) · **Next review:** immediately before fieldwork.
