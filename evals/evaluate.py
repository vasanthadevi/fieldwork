"""Score the checker: seeded bugs caught, and false alarms on the clean app."""

import asyncio
import json
from pathlib import Path

from fieldwork.run import run_mission
from fieldwork.servers import target_app

from .seeded_bugs import BUGS, CLEAN_REPEATS

HERE = Path(__file__).parent


def score(clean_runs: list, bug_runs: dict) -> dict:
    bugs = []
    for bug, expected in BUGS.items():
        seen = [f["kind"] for c in bug_runs[bug]["checks"] for f in c["findings"]]
        bugs.append({"bug": bug, "expected": expected, "caught": expected in seen,
                     "failing_checks": sum(c["verdict"] == "fail" for c in bug_runs[bug]["checks"]),
                     "unexpected_kinds": sorted(set(seen) - {expected})})
    checks = [c for r in clean_runs for c in r["checks"]]
    return {
        "bugs_seeded": len(bugs),
        "bugs_caught": sum(b["caught"] for b in bugs),
        "clean_checks": len(checks),
        "false_alarms": sum(c["verdict"] == "fail" for c in checks),
        "questions": len(clean_runs[0]["checks"]),
        "driver": "scripted",
        "bugs": bugs,
    }


async def run_all(base_url: str) -> dict:
    clean = [await run_mission(base_url, None, capture=i == 0) for i in range(CLEAN_REPEATS)]
    runs = {}
    for bug in BUGS:
        runs[bug] = await run_mission(base_url, bug)
        print(bug, flush=True)
    return score(clean, runs)


def report(result: dict) -> str:
    lines = ["# Fieldwork evaluation", "",
             f"- Seeded bugs caught: **{result['bugs_caught']}/{result['bugs_seeded']}**",
             f"- False alarms: **{result['false_alarms']}** in {result['clean_checks']} clean checks",
             f"- Driver: {result['driver']} (no LLM in this run)", "",
             "The checker and the bugs were written by the same author, so this shows the method works; "
             "it is not an estimate of real-world recall.", "",
             "| Bug | Expected finding | Caught | Failing checks | Other findings |", "|---|---|---|---|---|"]
    for b in result["bugs"]:
        lines.append(f"| {b['bug']} | {b['expected']} | {'yes' if b['caught'] else 'NO'} | "
                     f"{b['failing_checks']}/{result['questions']} | {', '.join(b['unexpected_kinds']) or '-'} |")
    return "\n".join(lines) + "\n"


def main():
    with target_app() as base_url:
        result = asyncio.run(run_all(base_url))
    (HERE / "results.json").write_text(json.dumps(result, indent=2))
    (HERE / "REPORT.md").write_text(report(result))
    print(report(result))


if __name__ == "__main__":
    main()
