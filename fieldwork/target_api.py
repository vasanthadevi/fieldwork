"""Deterministic stand-in for the copilot backend.

It answers mission questions with their gold SQL, so evaluation runs measure the
display layer only. The real LLM backend can replace it via TARGET_URL.
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .cases import BY_QUESTION
from .gold import run_gold

app = FastAPI(title="Fieldwork target API")


class AskRequest(BaseModel):
    question: str


def explain(columns: list, rows: list) -> str:
    if not rows:
        return "No rows matched."
    last = rows[0][-1]
    if len(rows) == 1 and isinstance(last, (int, float)):
        return f"The answer is {last:,}."
    if isinstance(last, (int, float)):
        return f"{rows[0][0]} leads with {last:,}."
    return f"Found {len(rows)} results."


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/ask")
def ask(req: AskRequest):
    case = BY_QUESTION.get(req.question)
    if case is None:
        raise HTTPException(400, "Unknown mission question")
    gold = run_gold(case.gold_sql)
    return {
        **gold,
        "sql": case.gold_sql,
        "explanation": explain(gold["columns"], gold["rows"]),
        "tables_used": [],
        "row_count": len(gold["rows"]),
        "repaired": False,
        "attempts": [],
    }
