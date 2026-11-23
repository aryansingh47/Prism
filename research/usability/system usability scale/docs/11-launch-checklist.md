# 11 · Preflight, Pilot, Fieldwork and Publication Checklist

## A. Ownership and privacy — mandatory before inviting anyone

- [ ] Assign research owner, facilitator, observer, analyst, product approver and response-data custodian.
- [ ] Get internal approval of participant-facing information and local privacy/data-processing arrangements.
- [ ] Fill all `[PLACEHOLDER]` values in consent script/form descriptions; choose approved retention period and withdrawal deadline.
- [ ] Decide whether any audio/screen/video will be recorded; default is OFF. Obtain separate affirmative consent if used.
- [ ] Create private storage for linked Forms, linked Sheets, consent records and any withdrawal-code mapping.
- [ ] Ensure public repo contains zero participant/employee personal information, secrets and production customer data.

## B. Actual website verification — do NOT skip

- [ ] Confirm tested URL: `[________________]`.
- [ ] Confirm build/commit and release time: `[________________]`.
- [ ] Check whether homepage/service overview is public and available.
- [ ] Check whether holiday/packages page exists; if none, T02's **custom-trip enquiry route** is feasible.
- [ ] Check whether flight/hotel enquiry contact route is visible and reachable without submitting (T03).
- [ ] Check corporate-travel/group-service information (T04).
- [ ] Check contact info appears current and credible (T05).
- [ ] Check combined flight/hotel/transfer enquiry can plausibly be initiated (T06).
- [ ] Check accessible keyboard focus, text scaling, broken links, mobile navigation and no session errors in the chosen browser.
- [ ] Confirm SIA text feature availability; if voice exists, document browser/permissions/feature flag; **do not mix with core SUS**.
- [ ] Confirm no tasks demand a live payment, real booking, staff login, personal details or confidential travel data.
- [ ] Freeze tested website state or record all change windows.

**Feature decision log**

| Feature | Available? | Route / URL | Action for research |
| --- | --- | --- | --- |
| Core public services | `[Y/N]` | `[ ]` | `[ ]` |
| Leisure or custom-trip route | `[Y/N]` | `[ ]` | `[ ]` |
| Enquiry/contact flow | `[Y/N]` | `[ ]` | `[ ]` |
| Corporate travel | `[Y/N]` | `[ ]` | `[ ]` |
| Airport/ground transport info | `[Y/N]` | `[ ]` | `[ ]` |
| SIA text/voice | `[Y/N]` | `[ ]` | `[optional only]` |

## C. Google Forms setup

- [ ] Create **Form A** consent and **Form B** post-test SUS using `forms/SETUP.md`.
- [ ] Check forms have the correct owner, description, consent details, external access and no email collection.
- [ ] Verify **all ten SUS statements** and their order; each scale is required with 1–5 anchors.
- [ ] Verify SUS appears **before** task difficulty and free-text reflections.
- [ ] Verify Forms response spreadsheets are restricted and non-public.
- [ ] Submit **one clearly labelled fake pilot response**; test export/scoring; delete this response before real collection.
- [ ] Test form submission in an incognito window and on the target browser; no Google login unexpectedly required.

## D. Pilot (1–2 participants)

- [ ] Check each task's viability, clarity, end condition and allowed time cap.
- [ ] Verify timer trigger, hint coding, observation fields and response mapping.
- [ ] Remove leading language and inconsistent starting states; **do not** show how the site works.
- [ ] Confirm technical reliability for entire session, including reset and SIA exclusion.
- [ ] Freeze protocol version before main sample. Label pilot data separately, and exclude from core analysis if changes were material.

## E. For each main session

- [ ] Assign participant code and verify consent *before* data collection.
- [ ] Record device/build/browser and moderator in private session metadata.
- [ ] Read script; have participant think aloud without directing navigation.
- [ ] Start/stop timer for T01–T06 consistently; capture success, hints, errors and quotes.
- [ ] No live message, payment, ID input or booking; stop immediately if sensitive personal data appears.
- [ ] Administer SUS independently immediately after core tasks.
- [ ] Debrief; optional SIA exploration after core SUS only if separately agreed.
- [ ] Check records for completeness and secure storage; reset browser between sessions.

## F. Analysis and closeout

- [ ] Remove pilot/fake rows from production sample.
- [ ] Validate all ten SUS responses, ID uniqueness, consistent build and task codes.
- [ ] Run `python3 -m unittest discover -s tests -v` and scoring script.
- [ ] Report N, task denominators, assisted outcomes, timeouts and not-evaluable cases transparently.
- [ ] Create evidence-backed, severity-rated issues and publish only suitably de-identified aggregates.
- [ ] Document study limitation and any protocol deviation.
- [ ] Schedule issue retest and record acceptance criteria.
- [ ] Apply withdrawal requests and approved retention/deletion policy.
