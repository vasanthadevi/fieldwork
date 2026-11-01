"""Records a run as JSON plus evidence screenshots for the replay UI."""

import json
import time
from pathlib import Path


class Trace:
    def __init__(self, run_id: str, meta: dict, out_dir: Path | None = None):
        self.run_id, self.meta, self.out_dir = run_id, meta, out_dir
        self.steps, self.checks = [], []
        self.started = time.perf_counter()
        if out_dir:
            out_dir.mkdir(parents=True, exist_ok=True)

    def _add(self, **step):
        step["at_ms"] = round((time.perf_counter() - self.started) * 1000)
        self.steps.append(step)
        return step

    def note(self, text: str, source: str = "script"):
        self._add(kind="note", source=source, text=text)

    def tool(self, name: str, args: dict, note: str, ms: float):
        self._add(kind="tool", tool=name, args=args, note=note, ms=round(ms))

    def check(self, case, screen: dict, gold: dict, graded: dict, image: bytes | None):
        shot = None
        if image and self.out_dir:
            shot = f"{len(self.checks):02d}-{case.id}.jpg"
            (self.out_dir / shot).write_bytes(image)
        record = {"case": case.id, "question": case.question, "gold_sql": case.gold_sql, "ordered": case.ordered,
                  "screen": screen, "gold": gold, "screenshot": shot, **graded}
        self.checks.append(record)
        self._add(kind="verdict", case=case.id, verdict=graded["verdict"], findings=graded["findings"],
                  check=len(self.checks) - 1)
        return record

    def to_dict(self) -> dict:
        return {"id": self.run_id, **self.meta, "duration_ms": round((time.perf_counter() - self.started) * 1000),
                "steps": self.steps, "checks": self.checks}

    def save(self) -> dict:
        data = self.to_dict()
        if self.out_dir:
            (self.out_dir / "trace.json").write_text(json.dumps(data, indent=1))
        return data
