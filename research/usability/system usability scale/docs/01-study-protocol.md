# 01 · PRISM Website Usability Study — Research Protocol

| Control | Detail |
| --- | --- |
| Study identifier | PRISM-UX-001 |
| Version | 1.0 (draft for approval) |
| Prepared | 21 November 2026 |
| Sponsor | PRISM Travel and Advisory Limited / TRIP by PRISM |
| Product | Public-facing PRISM website — exact deployed URL/version to record |
| Research owner | **[assign]** |
| Facilitator / note-taker | **[assign per session]** |
| Planned field dates | **[confirm]** |
| Target population | Adult prospective leisure and business-travel customers |
| Decision | Identify UX defects and prioritise changes before the next release |

## 1. Executive summary

This study assesses whether first-time prospective visitors can understand PRISM's travel offering and confidently progress toward a relevant enquiry. It uses moderated, scenario-based usability tasks followed by a 10-item System Usability Scale (SUS) questionnaire. Observational evidence (success, time, missteps, help requests) is triangulated with participant reflections and SUS ratings. The findings will produce specific, evidenced GitHub issues and a defensible baseline for later comparison.

SUS measures **overall perceived usability**, not objective correctness, visual appeal, trustworthiness, conversion or successful booking on its own. The study therefore collects objective task data and qualitative observations as complementary evidence.

## 2. Research questions

1. Can users explain PRISM's service proposition within their first encounter with the site?
2. Can users locate a relevant leisure offer, custom-travel route or clear next step without facilitator assistance?
3. Can visitors recognise the route for a travel enquiry without mistaking it for an immediate purchase obligation?
4. Can a business client locate corporate/group-travel support?
5. Can users find a credible method of contacting PRISM, and distinguish a support channel from a transaction?
6. Can a user combine service information into a coherent next action for a multi-service itinerary?
7. Which wording, controls, hierarchy, interaction and accessibility barriers prevent or slow progress?
8. How do participants rate the site overall on the standard SUS after the core tasks?

## 3. Scope

### Included
- Public informational pages and visible navigation; services, packages/holiday offerings if present, enquiries and contact routes.
- Desktop OR mobile within a defined cohort (same browser/device specification documented for each session).
- Error prevention, content clarity, page recovery, layout comprehension, and navigation/accessibility obstacles visible during task performance.

### Excluded unless separately authorised and fully available
- Payment, actual booking confirmation, travel document upload, customer account creation, password recovery, staff portal, live transaction or production support messages.
- SIA text and voice interactions: tested in the *optional module* after the core SUS, unless included uniformly in a new, separately described study round.
- API fulfilment accuracy, supplier inventory, pricing promises or legal compliance certification.

**Feature gate:** Check the live website with `11-launch-checklist.md`. If a service or CTA is missing, classify whether the task can still be accomplished using a **natural enquiry route**. Do not tell participants how to find it. If the intended journey is impossible owing to deployment limitations, flag the task as not evaluable rather than quietly changing it mid-session.

## 4. Methodology

**Design:** Moderated, mostly formative mixed-method study with six goal-driven tasks, direct observation, neutral think-aloud prompts and one post-task SUS survey. One facilitator and (ideally) one observer per session; a single moderator may operate both roles with reduced detail.

**Order:** Introduction → informed consent → non-leading first impression → T01–T06 → *independent SUS* → short task ratings and open-ended feedback → optional SIA module → closing. The exact task order must be held constant for a round, unless the team deliberately randomises and tracks order. Avoid introducing a product tutorial that contaminates first-use learnability.

**Environment:** Quiet location or moderated remote screen sharing. Record desktop/mobile category, OS/browser versions, zoom, language, accessibility needs voluntarily disclosed, network disruptions and product release/commit. Do not record sensitive browser contents or expose another user's data.

**Estimated session:** 40–50 minutes; 5 minutes introduction and consent, 25–30 minutes tasks, 5–7 minutes survey, 5–8 minutes debrief. These are scheduling assumptions, not task-time performance targets. Separate optional modules may extend the session only with consent.

## 5. Participants

**Preferred:** 12–16 adults (18+) across relevant customer segments, including participants not associated with the build team. Seek a mix of domestic/international trip interest, online booking confidence, age bands where voluntarily provided and leisure vs. business travel intentions. For a first diagnostic pass, 5–8 is acceptable for finding problems; do not claim population representativeness from this sample.

**Selection:** Must be 18+, comfortable giving voluntary consent, able to use the test language, and not closely involved in designing PRISM. Recruit both digitally confident and less confident travellers. Avoid requiring real purchasing intentions or forcing anyone to disclose private circumstances.

**Segmentation:** Record `participant_type` (leisure, business, mixed), `device_group` (desktop/mobile) and `experience` (rarely/sometimes/often plans travel online). Report these as small-n descriptive cuts only. Do not pool different product builds or radically different task sets as if comparable.

**Recruitment and compensation:** Invite via neutral channels; compensation (if offered) must be defined in advance and not conditional on task performance. Declining must have no impact on employees' or customers' relationships with PRISM. For internal participants, explicitly recognise the power imbalance.

## 6. Procedure and responsibilities

**Research lead** approves scope, obtains organisational privacy sign-off, freezes test build, selects pilot, maintains the issue tracker and interprets findings. **Facilitator** obtains consent, gives neutral tasks, manages time/withdrawals, and never teaches the UI. **Observer** records behaviour, quotes, time, errors, help and task outcome. **Analyst** validates rows, computes SUS, synthesises themes and checks evidence before reporting. The same person may hold multiple roles, but participant privacy and consistency still apply.

Before each participant: restore home page, close prior session, clear any previous form/chat/test state appropriately, check link availability and start a new observation record. Do not let prior participants' personal information persist. Obtain consent before any observation or recording.

During each task: start timer once the task is read and participant signals readiness; stop on stated end condition, abandonment or time cap. Wait briefly on hesitation; only prompt **“What are you thinking?”** or **“What would you try next?”**. If help is necessary, use the standard hint protocol and mark completion as assisted.

After all tasks: ask participants to complete the **10 SUS items in their given order, without assistance or discussion**. They are rated from strongly disagree (1) to strongly agree (5). Collect task-specific diagnostic ratings only **after** SUS so as not to pre-frame the standardized assessment. Then ask debrief questions and thank them.

## 7. Tasks and measurable outcomes

| Task | Primary question | Successful outcome | Suggested cap (pilot-adjustable) |
| --- | --- | --- | --- |
| T01 | First impression | Correctly identifies at least two real service categories from the site | 3 minutes |
| T02 | Leisure discovery | Locates a relevant leisure option or a clear custom-trip enquiry route | 4 minutes |
| T03 | Enquiry initiation | Finds a channel/CTA to request flight + accommodation help, stopping before submission | 4 minutes |
| T04 | Corporate travel | Locates corporate/group travel information and next contact step | 4 minutes |
| T05 | Help and contact | Finds a valid customer contact channel and explains how they would use it | 3 minutes |
| T06 | Multi-service journey | Identifies how to enquire about flight, hotel and ground transport in one trip | 5 minutes |

Caps are upper bounds for a session; tune in the pilot **before** collecting the main-round data. Do not equate a cap with the desired completion time. Record abandoned/timeout separately from completed timing. Participants can stop earlier.

Outcome codes: `success_unassisted`, `success_assisted`, `partial`, `failed`, `not_evaluable`. An outcome may be successful yet involve major usability problems; observation must explain them. A feature absent by design should be coded `not_evaluable` if its availability was a prerequisite, not scored as a participant failure.

## 8. Measures and prespecified decision rules

**Primary:** Mean SUS (individual scores 0–100) with N, median, range and cautiously interpreted uncertainty. A mean **≥75** is an aspirational internal goal for this study—not an industry certification or statistical pass/fail threshold. Do not treat 68 as a universal normative cutoff; if used, identify it as a commonly cited contextual comparison from broad datasets rather than a guaranteed benchmark for travel sites.

**Secondary:** Per-task independent completion rate (unassisted successes / evaluable attempts); assisted completion; median completion time among observed completed attempts; abandonment and not-evaluable counts; number/character of critical errors; qualitative themes; severity (0–4). Suggested diagnostic targets: ≥85% unassisted on core T01/T03/T05, and ≥75% on remaining tasks, *subject to revision after pilot*. With 12 participants, single observations shift rates materially; attach numerator and denominator to all claims.

**Time:** Set realistic per-task expected times from the pilot and document revisions *before* testing. Do not overinterpret averages that exclude timeouts. Record censored/timeout attempts distinctly.

**Optional:** Confidence in next steps (1–5), perceived trust (1–5), accessibility friction and clarity of service scope. These are **custom items** and must not be included in the SUS total.

## 9. Analysis plan

1. Check duplicate participant IDs, all ten SUS answers, scale bounds, device/build consistency and task status values.
2. Compute each SUS score using standard alternating adjustment. Show study mean, median, min/max, N. Use bootstrap interval only as exploratory small-sample uncertainty, not a population guarantee.
3. For each task, report number attempted/evaluable, unaided success, assisted success, partial, failed and not evaluable; inspect times separately and report the denominator.
4. Build an affinity log of observed issues with quote IDs, task IDs, page URL/area and evidence source. Count participants affected, not repeated incidents, when summarising frequency.
5. Rate each issue using Nielsen's 0–4 rubric, adding frequency, business criticality and fix effort as distinct fields. Do not inflate severity merely because a low-stakes issue occurs often.
6. Present an evidence-backed issue register; assign owners/estimated effort and propose retesting of priority issues.
7. State sampling limitations, missing data, assisted tasks, build changes, participant recruitment bias and any observed moderator effects.

## 10. Ethical, safety and operational requirements

Explain voluntary participation, withdrawal, observation, tools, use of anonymous/pseudonymous results and recording choices; ask separately before audio/video/screen recording (default **OFF**). Avoid passport numbers, payments, passwords, travel companions' details and sensitive personal information in scenarios or chat. Do not ask participants to complete real purchases or actually submit enquiries unless the production team has authorised a dedicated test route that cannot reach real sales records.

Keep raw files restricted to nominated staff. The public GitHub repository should contain only templates, code and vetted aggregates. Define the actual contact for withdrawal and the company's approved retention period before fieldwork. A suggested research operating default is to erase raw records **90 days after report approval**, but the organisation must approve a legally appropriate period and any legal holds.

## 11. Risks, limitations and dependencies

- Website changes during the round: freeze build or log each version and split analysis.
- SIA flag/caching/voice outages: route to separate exploratory module, never presume availability.
- Third-party booking inventory or travel data unstable: do not measure supplier correctness as website usability.
- Observer reactivity/leading language: use fixed script; record prompts and assistance.
- Convenience sampling / sample size: findings are diagnostic, not statistically representative.
- Accessibility: offer needed accommodations without recording medical or disability diagnoses.
- Production events: halt rather than transmit test data as real customer enquiries.

## 12. Deliverables and acceptance criteria

- Consistent anonymised study dataset; validated SUS scores; per-task effectiveness/timing summary.
- Ranked findings with participant counts, exact evidence, reproduction steps, owner, proposed remedy and verification plan.
- A decision log: changes to release now / backlog / require additional research.
- Protocol version, build tested and explicit unresolved assumptions.

**Approval gates:** Product owner [ ], research owner [ ], privacy/contact owner [ ], pilot completed [ ], task text frozen [ ].
