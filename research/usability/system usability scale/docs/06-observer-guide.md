# 06 · Observer and Researcher Scorecard Guide

The observer records what happened, **not what the participant should have done**. Keep the participant-facing tasks separate from this guide.

## Required fields per task

| Field | How to record |
| --- | --- |
| `participant_id` | Code such as P001; no name |
| `session_date` | ISO date YYYY-MM-DD |
| `device_group` | desktop/mobile/tablet |
| `build_id` | Release or commit hash shown by research lead |
| `task_id` | T01 ... T06 |
| `status` | One of the five outcome codes below |
| `seconds` | Decimal seconds from ready to completion/timeout; blank if not measurable |
| `hint_level` | H0/H1/H2; exact hint in notes |
| `errors` | Count wrong turns, dead ends or unexpected actions; define incidents consistently |
| `navigation_path` | Short path e.g. Home > Services > Corporate > Contact |
| `quote` | Short participant statement, verbatim and de-identified |
| `observation` | Behaviour and task-relevant friction; separate fact from inference |
| `issue_ids` | Corresponding UX issues, if already triaged |

## Standard outcome codes

- `success_unassisted`: task end condition met with **H0**, no directional guidance.
- `success_assisted`: outcome met after any H1/H2 hint.
- `partial`: some progress but not the agreed task end condition.
- `failed`: not completed / participant abandoned / timed out / incorrect next action.
- `not_evaluable`: missing feature or external condition prevents fair evaluation independently of participant (record precisely).

These are **mutually exclusive**. Do not encode "timeout" as time zero; log measured time and `failed` with `observation='timeout at ...'`. Use `not_evaluable` only for actual environmental/task invalidity, not simply because the participant was confused.

## Hint rubric

- **H0 none:** quiet observation, neutral think-aloud prompts, no directional help.
- **H1 generic:** e.g., “Try anything that feels natural to you.” Mark assisted if used to restart after blockage.
- **H2 directional:** names a region/category, reveals interface location or directs an action. Mark assisted; deviations may weaken comparability.

The preamble's routine think-aloud prompts do not automatically count as task hints, but record unusually frequent prompting. Log when any hint was issued and the exact words.

## Observation prompts by task (researcher only)

**T01** — Which service cards/links are noticed? Does the participant confuse a corporate service for a leisure product? Are key categories distinguishable at first glance?

**T02** — Does the participant expect ready-made packages or bespoke planning? Can they infer whether the offering is actually available? Does search/navigation produce dead ends?

**T03** — Is the enquiry CTA discoverable? Does the form communicate expected fields and what follows? Does it mistakenly imply payment, pricing guarantee or booking completion? Stop short of submitting.

**T04** — Can the person distinguish corporate travel from MICE/events and leisure travel? Is an appropriate next action clear?

**T05** — Are phone/email/contact options easy to find? Does a user consider contact information credible and current? Do not verify phone delivery by sending live content.

**T06** — Does the service information support a combined request or split the journey confusingly? Can the user recover from dead ends and explain expectations?

## Recording and timing

Start timer at readiness after reading the exact task; end at stated success, abandonment or cap. If participant reads slowly, exclude reading from timed navigation by standardising the trigger. If pages load slowly, timing **includes loading**, and the observer marks network/server issue. Note interruptions; no estimated values masquerading as measured times.

**One row per attempted task per participant** in `templates/task_observations.csv`. Check that the participant code matches the survey. The observer should add qualitative notes immediately after each session while recollection is fresh.

## Example of appropriate observation language

**Observed:** “At 00:43 the participant clicked a service card, returned to homepage twice, then said ‘I can't tell whether I should call or fill this out.’ No hints. T03 not completed at 4:00 cap.”

**Not appropriate:** “The participant isn't smart enough to find the obvious button.”

## Issue escalation

Immediately tell the lead about leakage of private customer data, unsafe payment routes, broken authentication exposure or other security/privacy issues. Do not document secrets in screenshots, notes or GitHub. Escalation does not require waiting for an aggregate UX report.
