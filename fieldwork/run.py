"""Run one mission. Example: python -m fieldwork.run --bug rounded-values"""

import argparse
import asyncio
import json
from pathlib import Path

from .browser import open_browser
from .mission import scripted_mission
from .servers import target_app
from .trace import Trace

RUNS = Path(__file__).parent.parent / "runs"


async def run_mission(base_url: str, bug: str | None, driver: str = "scripted", capture: bool = True) -> dict:
    run_id = bug or "clean"
    trace = Trace(run_id, {"driver": driver, "bug": bug, "target": "analytics-copilot client + gold fixture API"},
                  RUNS / run_id if capture else None)
    url = f"{base_url}/?bug={bug}" if bug else base_url
    async with open_browser(trace) as browser:
        if driver == "claude":
            from .agent import claude_mission
            await claude_mission(browser, trace, url)
        else:
            await scripted_mission(browser, trace, url, capture)
    return trace.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--bug")
    parser.add_argument("--driver", choices=["scripted", "claude"], default="scripted")
    args = parser.parse_args()
    with target_app() as base_url:
        data = asyncio.run(run_mission(base_url, args.bug, args.driver))
    for c in data["checks"]:
        print(c["verdict"].upper(), c["case"], [f["kind"] for f in c["findings"]])
    print(json.dumps({"ms": data["duration_ms"], "steps": len(data["steps"])}))


if __name__ == "__main__":
    main()
