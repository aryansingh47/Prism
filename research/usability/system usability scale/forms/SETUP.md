# Google Forms — Creation and Private Export

The included `create_prism_forms.gs` is a **Google Apps Script source file**, not an already-created Google Form. Run it once in a Google account under PRISM's control to create two separate live forms and two **private** Google Sheets. No third-party service or paid plugin is required for these steps.

## 1. What to prepare

- A Google account that should own the forms and spreadsheets, ideally an approved company Workspace account.
- The research contact email, actual participant privacy notice/consent text, approved retention period and withdrawal deadline.
- A completed `docs/11-launch-checklist.md` and confirmed website URL/build.
- Permission for external participants to access/respond to forms if your Workspace settings currently block them.

## 2. Create the forms

1. Open **https://script.google.com/** in the account that should own the files.
2. Select **New project**, name it `PRISM usability study forms`.
3. Replace the contents of `Code.gs` with the entire contents of `create_prism_forms.gs` from this repository.
4. Edit the `SETTINGS` block at the top (study contact, privacy notice, retention, withdrawal deadline). Use a real approved address and policy. Do not leave `[REPLACE...]` values in fielded forms.
5. Select the function **`createPrismStudyForms`** from the function dropdown, then click **Run**. On the first run, review Google's permissions request for Forms and Sheets; allow only if the script and account are approved.
6. Open **Executions** / **Execution log**. Copy the two **edit links**, two **respondent links**, and spreadsheet URLs shown there into a **private** research operations note. Do **not** publish edit/response links or raw data to a public GitHub repo.
7. The script persists IDs in the project's Script Properties so accidental reruns do not create a second study. It will **error rather than duplicate** if IDs are already set. To make a new round, create a fresh Apps Script project or deliberately reset the project after exporting data and documenting the prior round.
8. Review **Form A**, **Form B** and linked Sheets manually; check external responder access and settings in Google Forms. Google Workspace administrative policies may override form settings.

Google reference: https://developers.google.com/apps-script/reference/forms

## 3. What the script creates

**Form A: Consent**, with participant code and required confirmations. **Form B: Post-session**, with all 10 unchanged SUS items (1–5, required), then six task-difficulty scales, optional per-task feedback and overall qualitative questions. The forms are not a replacement for your task sheet or the observer stopwatch log.

**Sheet A:** Consent responses. **Sheet B:** SUS and feedback responses. Both are in the current account's private Drive by default; check access controls before collecting responses. Google Forms separately retains its response store even when linked to a Sheet.

## 4. Quality check before the first genuine participant

- Preview both forms, including with an external browser/private mode.
- Confirm no email collection and no accidental domain-only response restriction.
- Confirm `SUS01–SUS10` exact order, numeric 1–5 choices and full-item completion.
- Check that task ratings appear **after** SUS; the participant doesn't see observer success criteria.
- Submit a dummy `PTEST` response to **both** forms, verify both linked Sheets, run the export helper below, and **delete** all dummy responses and exports before the main study. If a dummy response remains in a form's internal response store, explicitly delete it there too.

## 5. Export for scoring — only with real, consented data

Run the function **`exportStandardizedSUS`** in the same Apps Script project. It reads Form B responses and creates/updates a `SUS_Standardized` tab in **private Sheet B** with columns matching `templates/sus_responses.csv`.

Then, in Sheet B, open the `SUS_Standardized` tab and use **File → Download → Comma-separated values (.csv)** for the current sheet. Keep the resulting file **outside the public Git repository**. Use the normalized CSV with:

```bash
python3 analysis/analyse_sus.py --sus /private/path/sus_responses.csv
```

For task metrics, fill `templates/task_observations.csv` from the separate research observer logs and pass `--tasks /private/path/task_observations.csv`. Do not populate the public template in-place with real participant data; use a private copy.

## 6. Known limitations

- A script run requires your Google authorisation; the script cannot publish/own the forms without it. **No actual respondent URL is present in this repository.**
- Repeated Google Forms fields may be exported with long question headings; the export function maps items by ID prefix `SUS01`, etc. Don't remove those prefixes from Form B without updating the helper.
- New forms can inherit organisational access policy; review who can respond and who can view the response Sheets.
- Google Forms may not support an entirely customised conditional consent flow for non-consenting participants. This form requires affirmative consent; **anyone declining should simply not submit it and should not begin testing**.
- An unsubmitted or withdrawn participant must not be quietly included in analysis. Handle code-based deletion in **both** Forms and Sheets if required; the helper does not perform withdrawal/deletion for you.
