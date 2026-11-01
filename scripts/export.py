"""Copy recorded runs and scores into the replay site."""

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "web" / "public" / "data"


def main():
    shutil.rmtree(DATA, ignore_errors=True)
    shutil.copytree(ROOT / "runs", DATA / "runs")
    for trace in (DATA / "runs").glob("*/trace.json"):
        data = json.loads(trace.read_text())
        data.pop("outline", None)
        trace.write_text(json.dumps(data, separators=(",", ":")))
    shutil.copy(ROOT / "evals" / "results.json", DATA / "results.json")


if __name__ == "__main__":
    main()
