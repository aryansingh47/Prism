# 07 · Exact Google Form Blueprint

Two separate forms are recommended, not one mixed researcher/participant form. `forms/create_prism_forms.gs` generates both plus private destination spreadsheets. This keeps **consent distinct from outcome measurement** and prevents researcher timing fields from contaminating participant feedback.

## Form A — PRISM | Participation and Consent

**When:** Immediately before the moderated session, after the information sheet and opportunity for questions.

**Description:** “Please read the participant information sheet supplied by the facilitator. The website is being tested, not your skills. Participation is voluntary; you may stop or withdraw as described. No payment, booking, identity document or genuine travel enquiry will be requested. Do not submit this form if you do not consent.” Replace research team privacy/contact placeholders before use.

| ID | Question | Type | Required | Responses / constraint |
| --- | --- | --- | --- | --- |
| C01 | Participant code (provided by researcher) | Short text | Yes | Non-identifying P001-type code |
| C02 | I confirm I am at least 18 years old. | Multiple choice | Yes | Yes, I confirm (do not offer an option that implies processing declines) |
| C03 | I have read the study information, know participation is voluntary and understand the withdrawal procedure. | Multiple choice | Yes | Yes, I understand |
| C04 | I voluntarily consent to take part in the usability session and have de-identified notes and survey responses analysed for this study. | Multiple choice | Yes | Yes, I consent |
| C05 | I understand I should not provide identity documents, payment details or real personal travel information. | Multiple choice | Yes | Yes, I understand |
| C06 | Optional: I separately agree to short de-identified quotations appearing in a public report. | Multiple choice | **No** | Yes, I agree (leave unanswered for no permission) |

**Important:** C06 is not needed for participation and must remain unchecked unless actively selected. If participants disagree with any required statement, **do not submit the consent form and do not run the session**. A declined participant's identity should not be entered into a research data set. Optional recording permissions, if recording is separately approved, must be added as **distinct optional and unchecked affirmative items**; this script creates no recording request because recording is off.

## Form B — PRISM | Post-Session Usability and SUS

**When:** Immediately after T01–T06. Google Form is completed independently, without discussion. SUS section **comes first**, with the ten statements in standard order; follow-up ratings and qualitative questions come later.

**Participant reference:** `P01 — Participant code` / short text / **required**. It links survey responses to observation rows without exposing a name.

### Section 1 — SUS (original 10 statements)

**Instruction:** “For these statements, **‘system’ means the PRISM public website you just used**. Think about the overall experience. For each statement select one number from 1 (Strongly disagree) to 5 (Strongly agree). Answer independently without overthinking.”

Scale: **1 Strongly disagree · 2 Disagree · 3 Neither agree nor disagree · 4 Agree · 5 Strongly agree**. All 10 items are required; question order fixed; no reversed display labels. Item text is based on the standard Brooke SUS wording, deliberately not personalised to change the construct.

| ID | Exact statement | Required | Scale |
| --- | --- | --- | --- |
| SUS01 | I think that I would like to use this system frequently. | Yes | 1–5 |
| SUS02 | I found the system unnecessarily complex. | Yes | 1–5 |
| SUS03 | I thought the system was easy to use. | Yes | 1–5 |
| SUS04 | I think that I would need the support of a technical person to be able to use this system. | Yes | 1–5 |
| SUS05 | I found the various functions in this system were well integrated. | Yes | 1–5 |
| SUS06 | I thought there was too much inconsistency in this system. | Yes | 1–5 |
| SUS07 | I would imagine that most people would learn to use this system very quickly. | Yes | 1–5 |
| SUS08 | I found the system very cumbersome to use. | Yes | 1–5 |
| SUS09 | I felt very confident using the system. | Yes | 1–5 |
| SUS10 | I needed to learn a lot of things before I could get going with this system. | Yes | 1–5 |

**Scoring:** Odd items contribute response−1; even items contribute 5−response; total ×2.5. No custom items are counted in SUS.

### Section 2 — Task-specific diagnostics (after SUS)

For each task `T01`–`T06`, ask: “T0X — How easy or difficult did you find this task?” (optional 1–5 scale, 1 Very difficult, 5 Very easy; skip if not attempted/evaluable), and “T0X — What, if anything, was confusing?” (optional paragraph). These ratings measure **perceived task difficulty**, not actual success or SUS; they do not replace the observer's success timing.

### Section 3 — Overall feedback (custom)

| ID | Question | Type | Required |
| --- | --- | --- | --- |
| F01 | How clear was it what PRISM can help you with? | 1–5 scale, Not clear at all → Extremely clear | Yes |
| F02 | How confident are you that you know the next step to enquire with PRISM? | 1–5 scale, Not at all confident → Extremely confident | Yes |
| F03 | How trustworthy did the website feel for an initial travel enquiry? | 1–5 scale, Not trustworthy → Very trustworthy | Optional |
| F04 | What worked particularly well? | Paragraph | Optional |
| F05 | What was the most frustrating or confusing part? | Paragraph | Optional |
| F06 | If you could change one thing, what would it be? | Paragraph | Optional |
| F07 | Was anything you expected missing? | Paragraph | Optional |

**Never** combine F01–F07 or T01–T06 difficulty with the SUS score; these are exploratory diagnostics only.

## Recommended Google Form settings

- Do not collect respondents' emails; do not require Google sign-in or restrict to a corporate domain, if participants are external.
- Keep question order fixed; do not enable shuffling or quiz mode.
- Disable "show summary of responses" to participants.
- No response-edit link unless the approved withdrawal process requires it; keep link access controlled.
- Publish the form for responders only when ready; check browser incognito and mobile access.
- Use separate private Google Sheets as linked response destinations; restrict access to named researchers.
- Confirm data collection/retention controls and Google account policies with PRISM before deployment.

## Researcher-only form? No

In the earlier university form, timed completion appeared as a supervisor-only question on a participant-facing form. For this study, keep stopwatch times, assistance and technical observations in the **private observation CSV** instead. Participants should never see the rubric or be responsible for timing their own tasks.
