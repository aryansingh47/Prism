# 10 · Severity, Research Findings and GitHub Issue Triage

## Nielsen severity rubric (0–4)

| Rating | Definition | PRISM example (hypothetical) |
| --- | --- | --- |
| 0 | Not considered a usability problem | Preference without demonstrated task impact |
| 1 | Cosmetic | Minor inconsistent icon spacing on an optional card |
| 2 | Minor usability problem | Hard-to-read secondary label, but task completes |
| 3 | Major usability problem | Core enquiry CTA repeatedly overlooked; participants require assistance |
| 4 | Usability catastrophe | Essential contact/enquiry journey impossible; no viable alternative route |

Severity is not automatically calculated by frequency. Assess **impact**, **persistence**, **number affected**, **criticality of the journey**, **availability of workaround**, and **potential risk**. Security/privacy issues may require immediate independent escalation regardless of UX classification.

## Issue logging requirements

Each issue must have an ID (`UX-001`), title phrased as a user-facing problem, affected URL/page, task(s), build/device, reproduction steps, expected vs actual behaviour, affected participant count, evidence excerpts, severity, owner, recommendation and measurable acceptance criteria. Avoid stating inferred user motives as fact.

**Tracking statuses:** `New → Needs validation → Prioritised → In progress → Ready to retest → Verified / Reopened → Closed`.

**Priority and severity are different:** A severity-3 problem with a fix that blocks conversion may be prioritised first, but a severity-2 issue could still be done sooner if trivial to fix. Use a separate priority ranking and record decision rationale.

## GitHub issue template (copy/paste into a new issue)

```markdown
## User problem
[What was difficult or failed? Describe from the user's perspective.]

## Evidence
- Research study: PRISM-UX-001
- Tasks: [T03, T05]
- Build/device/browser: [ ... ]
- Participants affected: [x / N evaluable]
- Observed behaviour: [de-identified, specific and factual]
- Participant quote (optional): [short, anonymised]

## Reproduction
1. [Go to the public test URL]
2. [Follow observed path]
3. [Observe actual behaviour]

## Expected / Actual
- Expected: [ ... ]
- Actual: [ ... ]

## Severity and priority
- Nielsen severity: [0–4]
- Product priority: [P0 / P1 / P2 / P3]
- Reason: [user impact and frequency]

## Proposed change (hypothesis)
[Design/content/engineering solution to evaluate]

## Acceptance criteria
- [ ] [Measurable behaviour]
- [ ] [No regression in adjacent flow]
- [ ] [Retested with representative users, or state reason for alternative verification]

## Owner and evidence links
Owner: [ ]
Private raw evidence: [restricted internal reference — never public Google response links]
```

## Practical PRISM labels

- `type:ux`, `research:PRISM-UX-001`, `area:homepage`, `area:leisure`, `area:enquiry`, `area:corporate`, `area:contact`, `area:accessibility`.
- `severity:1`, `severity:2`, `severity:3`, `severity:4` (for confirmed UX issue); use `priority:P0...P3` separately.
- `needs-retest`, `research-evidence`, `question:feature-availability`.

## Safeguards

Prior consent is for usability research and de-identified public reporting only. Screenshots must be cropped or redacted to remove identity, internal staff URLs, API keys, personal data, draft itineraries and chat messages. Never attach raw Google Forms spreadsheets to a GitHub issue.
