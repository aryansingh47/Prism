#!/usr/bin/env python3
"""Validate and analyse de-identified PRISM core usability study CSVs.

Python 3.9+; standard library only.
Use private input files, never commit real participant data or individual reports.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import statistics
from collections import defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Sequence

SUS_FIELDS = [f"SUS{i:02d}" for i in range(1, 11)]
TASK_IDS = [f"T{i:02d}" for i in range(1, 7)]
VALID_STATUSES = {
    "success_unassisted", "success_assisted", "partial", "failed", "not_evaluable"
}


def sus_score(answers: Sequence[int]) -> float:
    """Official alternating SUS adjustment; 0..100 in increments of 2.5."""
    if len(answers) != 10:
        raise ValueError(f"SUS requires 10 answers, received {len(answers)}")
    contributions = []
    for index, raw in enumerate(answers):
        if isinstance(raw, bool) or not isinstance(raw, int) or raw not in range(1, 6):
            raise ValueError(f"SUS answer {index + 1} must be integer 1..5: {raw!r}")
        contributions.append(raw - 1 if index % 2 == 0 else 5 - raw)
    return sum(contributions) * 2.5


def load_csv(path: Path) -> List[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames:
            raise ValueError(f"{path}: no CSV header")
        return list(reader)


def score_sus_csv(path: Path) -> dict:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or [])
        expected = {"participant_id", *SUS_FIELDS}
        if not expected.issubset(fields):
            raise ValueError(f"SUS CSV missing required columns: {sorted(expected - fields)}")
        rows = list(reader)

    if not rows:
        raise ValueError("SUS CSV contains no participant responses. Collect data before reporting results.")

    seen = set()
    individual = []
    for line, row in enumerate(rows, 2):
        code = (row.get("participant_id") or "").strip()
        if not code:
            raise ValueError(f"Line {line}: missing participant_id")
        if code in seen:
            raise ValueError(f"Line {line}: duplicate participant_id {code!r}")
        seen.add(code)
        answers = []
        for field in SUS_FIELDS:
            raw = (row.get(field) or "").strip()
            if raw not in {"1", "2", "3", "4", "5"}:
                raise ValueError(f"Line {line} ({code}): {field} requires one integer 1..5; received {raw!r}")
            answers.append(int(raw))
        individual.append({"participant_id": code, "sus": sus_score(answers)})

    scores = [item["sus"] for item in individual]
    summary = {
        "n": len(scores),
        "mean": round(statistics.mean(scores), 2),
        "median": round(statistics.median(scores), 2),
        "min": min(scores),
        "max": max(scores),
        "sample_standard_deviation": round(statistics.stdev(scores), 2) if len(scores) > 1 else None,
        "bootstrap_mean_95pct_interval": bootstrap_mean_ci(scores) if len(scores) >= 3 else None,
        "internal_target_mean": 75.0,
        "mean_meets_internal_target": statistics.mean(scores) >= 75.0,
        "note": "SUS is a 0–100 index, not a percentage or stand-alone certification."
    }
    return {"summary": summary, "individual": individual}


def bootstrap_mean_ci(scores: Sequence[float], repeats: int = 10000, seed: int = 20261121) -> list:
    """Seeded empirical percentile interval; exploratory for small convenience samples."""
    if len(scores) < 3:
        raise ValueError("Bootstrap output is reserved for N >= 3")
    rng = random.Random(seed)
    n = len(scores)
    means = sorted(sum(rng.choice(scores) for _ in range(n)) / n for _ in range(repeats))
    return [round(means[int(0.025 * (repeats - 1))], 2),
            round(means[int(0.975 * (repeats - 1))], 2)]


def task_summary(path: Path, valid_participant_ids: Optional[set] = None) -> dict:
    records = load_csv(path)
    if not records:
        return {"n_observations": 0, "tasks": {}, "note": "Empty task template; no task data analysed."}
    required = {"participant_id", "task_id", "status", "seconds", "hint_level"}
    missing = required - set(records[0])
    if missing:
        raise ValueError(f"Task observations CSV missing required columns: {sorted(missing)}")

    groups = defaultdict(list)
    seen = set()
    without_valid_sus = set()
    for line, row in enumerate(records, 2):
        code = (row.get("participant_id") or "").strip()
        task = (row.get("task_id") or "").strip()
        status = (row.get("status") or "").strip()
        hint = (row.get("hint_level") or "").strip()
        if not code or task not in TASK_IDS or status not in VALID_STATUSES or hint not in {"H0", "H1", "H2"}:
            raise ValueError(f"Task CSV line {line}: invalid participant/task/status/hint")
        if (code, task) in seen:
            raise ValueError(f"Task CSV line {line}: duplicate participant/task ({code}, {task})")
        seen.add((code, task))
        if valid_participant_ids is not None and code not in valid_participant_ids:
            without_valid_sus.add(code)  # May have valid task observations but missing SUS survey.
        if status == "success_unassisted" and hint != "H0":
            raise ValueError(f"Task CSV line {line}: unassisted success cannot have hint {hint}")
        if status == "success_assisted" and hint == "H0":
            raise ValueError(f"Task CSV line {line}: assisted success must have H1/H2 hint")
        raw_time = (row.get("seconds") or "").strip()
        seconds = None
        if raw_time:
            try:
                seconds = float(raw_time)
            except ValueError as exc:
                raise ValueError(f"Task CSV line {line}: invalid seconds {raw_time!r}") from exc
            if not (0 <= seconds <= 86400):
                raise ValueError(f"Task CSV line {line}: seconds outside 0..86400")
        if status in {"success_unassisted", "success_assisted"} and seconds is None:
            raise ValueError(f"Task CSV line {line}: successful task requires measured seconds")
        groups[task].append({"status": status, "seconds": seconds, "hint": hint})

    result = {}
    for task in TASK_IDS:
        items = groups[task]
        if not items:
            continue
        counts = {key: sum(item["status"] == key for item in items) for key in sorted(VALID_STATUSES)}
        evaluable = len(items) - counts["not_evaluable"]
        times = [item["seconds"] for item in items if item["status"] in {"success_unassisted", "success_assisted"} and item["seconds"] is not None]
        result[task] = {
            "attempts": len(items),
            "evaluable": evaluable,
            "status_counts": counts,
            "unaided_success_rate": round(counts["success_unassisted"] / evaluable, 4) if evaluable else None,
            "any_success_rate": round((counts["success_unassisted"] + counts["success_assisted"]) / evaluable, 4) if evaluable else None,
            "successful_time_n": len(times),
            "median_successful_seconds": round(statistics.median(times), 2) if times else None,
        }
    return {"n_observations": len(records), "tasks": result,
            "participant_ids_without_valid_sus": sorted(without_valid_sus)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Analyse private PRISM SUS study exports (never commit real data).")
    parser.add_argument("--sus", type=Path, required=True, help="Normalized private SUS responses CSV")
    parser.add_argument("--tasks", type=Path, help="Optional private task observations CSV")
    parser.add_argument("--json", type=Path, help="Optional private JSON aggregate summary output path")
    args = parser.parse_args()

    scores = score_sus_csv(args.sus)
    result = {"study": "PRISM-UX-001", "sus": scores["summary"]}
    if args.tasks:
        result["tasks"] = task_summary(args.tasks, {item["participant_id"] for item in scores["individual"]})

    print("PRISM website usability study | private analysis")
    print("IMPORTANT: output is not a public report; do not commit raw data or identify participants.\n")
    print("SUS (0–100 index):")
    for key, value in scores["summary"].items():
        print(f"  {key}: {value}")
    if "tasks" in result:
        print("\nCore task outcomes:")
        if not result["tasks"]["tasks"]:
            print("  No task observations available.")
        if result["tasks"].get("participant_ids_without_valid_sus"):
            print("  AUDIT: task observations exist for IDs without valid SUS:",
                  ", ".join(result["tasks"]["participant_ids_without_valid_sus"]))
        for task, summary in result["tasks"]["tasks"].items():
            print(f"  {task}: {summary['status_counts']} | unaided {summary['unaided_success_rate']} | median completed sec {summary['median_successful_seconds']}")
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
        print(f"\nPrivate aggregate output: {args.json}")


if __name__ == "__main__":
    main()
