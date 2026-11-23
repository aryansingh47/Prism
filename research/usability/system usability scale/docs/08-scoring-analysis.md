# 08 · SUS Scoring, Quantitative Analysis and Interpretation

## Standard SUS rules

SUS is a 10-item, five-response-point scale developed by John Brooke. For participant responses `SUS01...SUS10`, each an **integer 1–5**:

- Odd-numbered questions (1, 3, 5, 7, 9): subtract 1 from the answer.
- Even-numbered questions (2, 4, 6, 8, 10): subtract the answer from 5.
- Sum all 10 contributions (each 0–4) and multiply by **2.5**.

Formula:

```text
SUS = 2.5 × [ (Q1−1) + (5−Q2) + (Q3−1) + (5−Q4) + (Q5−1)
              + (5−Q6) + (Q7−1) + (5−Q8) + (Q9−1) + (5−Q10) ]
```

Example *for a scoring check only (fictional, not study data)*:

```text
Q1..Q10 = [4,2,4,2,4,2,4,2,4,2]
contributions = [3,3,3,3,3,3,3,3,3,3]
SUS = 30 × 2.5 = 75.0
```

Edge cases: all 3s yield **50**; ideal alternation 5/1 yields **100**; reverse alternation 1/5 yields **0**. SUS score is an **index**, not a probability, percentile, or percentage of users who found it usable.

## Missing or invalid responses

All ten answers are required to compute an individual SUS score for this protocol. An out-of-range, missing or non-numeric answer **invalidates that record**; do not insert 3, average available items, or quietly impute. Document how many records were excluded and why; collect a fresh response only when appropriate under consent procedures. Preserve raw responses privately.

## Data schema

`templates/sus_responses.csv` must contain exactly an identifying column `participant_id` and numeric columns `SUS01...SUS10`; optional additional CSV columns are allowed and ignored by the scorer. Do **not** commit responses. Export responses from private Google Sheets into this standardized schema using the included Apps Script helper or map the raw Google Forms columns manually. One row per participant (one core SUS completion). Duplicate participant codes are rejected. A consented participant may have task observations even if they skipped the SUS; the task analyser preserves such records and flags unmatched IDs for researcher review rather than silently deleting task evidence.

`templates/task_observations.csv` captures one row per participant/task. Status options are defined in `06-observer-guide.md`. Never invent times for unfinished tasks.

## Reproducible command-line scorer

```bash
python3 analysis/analyse_sus.py --sus /path/to/sus_responses.csv \
  --tasks /path/to/task_observations.csv \
  --json /path/to/private-summary.json
```

The script uses Python standard library only. It validates the 1–5 bounds and unique participant IDs; computes mean, median, min/max and sample standard deviation (if N≥2); shows task outcomes and completed task times. A seeded bootstrap 95% interval is provided when N≥3 as a descriptive uncertainty indicator, not a population guarantee. Do not share individual participant scores publicly.

**Tests:** `python3 -m unittest discover -s tests -v`

## Primary reporting table (fill after collection)

| Metric | Observed | Denominator / method | Interpretation |
| --- | --- | --- | --- |
| Valid SUS responses | `[N]` | All complete valid records | Study count |
| Mean SUS | `[mean]` | Arithmetic mean of participant SUS | Primary perceived-usability baseline |
| Median SUS | `[median]` | Median of participant SUS | Robust contextual summary |
| SUS score range | `[min–max]` | Individual scores | Sample dispersion |
| 95% bootstrap interval | `[lower–upper]` | Exploratory resampling of the mean | Uncertainty, not formal pass/fail |
| Overall unaided task completion | `[x/y]` | Unassisted / evaluable task attempts | Effectiveness |
| Most severe blockers | `[number]` | Issue register, severity 3–4 | Release prioritisation |

## Task performance

Per task, calculate:

- **Unassisted completion rate:** `success_unassisted / (all attempts − not_evaluable)`.
- **Total completion rate:** `(success_unassisted + success_assisted) / evaluable attempts`.
- **Median time for successful attempts:** median measured seconds of successful unassisted/assisted outcomes; label which are included and provide N. Failure/timeout times are not successes and must be reported separately.
- **Observed difficulties:** count distinct **participants** affected by each issue; not just clicks or repetitions.

Use `not_evaluable` only when a task cannot be validly assessed independent of participant actions. If a feature is central and absent in production, document it as a scope/design risk even though the behavioural task is unevaluable.

## Making a release decision

Aspirational SUS ≥75, but one sample mean cannot guarantee an adequate product. A useful release review asks whether critical tasks are completed unaided; whether severity-4 problems or serious privacy/security defects remain; whether contact/enquiry routes are clear; and whether SUS and qualitative comments tell a coherent story. A high SUS can coexist with a severe isolated failure, especially on a rarely-used critical workflow.

**Do not compare** SUS scores across different task sets, participant profiles or device/build variants without naming the differences. Summarise descriptive subgroups, not infer representativeness.

## Evidence taxonomy

- **Direct observation:** click path, hesitation, error, exact outcome and time.
- **Verbal report:** participant's own quote (clearly quoted, de-identified).
- **Survey rating:** SUS or custom item; reported independently.
- **Interpretation:** proposed explanation by research team, explicitly labelled as hypothesis.
- **Recommendation:** change to design/product; should be traceable to evidence.

## Sources

- Brooke (1996), original SUS: https://doi.org/10.1201/9781498710411
- Canonical item wording: https://openscales.net/scale.php?code=SUS
- Computation example: https://digital.ahrq.gov/sites/default/files/docs/survey/systemusabilityscale%2528sus%2529_comp%255B1%255D.pdf
- Nielsen Norman Group severity framework: https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/
