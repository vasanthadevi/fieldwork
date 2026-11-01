"""Compare what the screen shows with what the database says. No AI involved."""

import re
from collections import Counter

TOLERANCE = 1e-4
CHART_TOLERANCE = 0.03


def parse_number(text: str) -> float | None:
    """Parse en-US display text; anything else is not a number."""
    s = text.strip()
    if not re.fullmatch(r"-?\d{1,3}(,\d{3})*(\.\d+)?|-?\d+(\.\d+)?", s):
        return None
    return float(s.replace(",", ""))


def looks_like_other_locale(text: str) -> bool:
    return bool(re.fullmatch(r"-?\d{1,3}(\.\d{3})+(,\d+)?|-?\d+,\d{1,2}", text.strip()))


def expected_text(value) -> str:
    return "null" if value is None else str(value)


def cell_equal(shown: str, gold) -> bool:
    if gold is None:
        return shown.strip() == "null"
    if isinstance(gold, (int, float)):
        n = parse_number(shown)
        return n is not None and abs(n - gold) <= TOLERANCE
    return shown.strip() == str(gold)


def row_equal(shown: list, gold: list) -> bool:
    return len(shown) == len(gold) and all(cell_equal(s, g) for s, g in zip(shown, gold))


def finding(kind: str, detail: str, shown=None, expected=None) -> dict:
    return {"kind": kind, "detail": detail, "shown": shown, "expected": expected}


def check_table(screen: dict, gold: dict, ordered: bool, previous: dict | None) -> list:
    shown_cols, shown = screen["columns"], screen["rows"]
    gold_cols, rows = gold["columns"], gold["rows"]

    if previous and previous["rows"] != rows and shown_cols == previous["columns"] and _matches(shown, previous["rows"]):
        return [finding("stale_answer", "The table still shows the previous question's answer.")]
    if shown_cols != gold_cols:
        return [finding("column_mismatch", "Column headers differ from the query result.", shown_cols, gold_cols)]
    if len(shown) < len(rows) and all(any(row_equal(s, g) for g in rows) for s in shown):
        return [finding("missing_row", f"{len(rows) - len(shown)} row(s) missing from the table.", len(shown), len(rows))]
    if len(shown) != len(rows):
        return [finding("row_count_mismatch", "Table has the wrong number of rows.", len(shown), len(rows))]

    if _matches(shown, rows):
        if ordered and not all(row_equal(s, g) for s, g in zip(shown, rows)):
            return [finding("order_mismatch", "Rows are in the wrong order.", shown[0], rows[0])]
        return []

    pairs = zip(shown, rows) if ordered else _align(shown, rows)
    for s_row, g_row in pairs:
        for col, s, g in zip(shown_cols, s_row, g_row):
            if not cell_equal(s, g):
                return [_cell_finding(col, s, g)]
    return [finding("value_mismatch", "Table values differ from the query result.")]


def _matches(shown: list, rows: list) -> bool:
    remaining = list(rows)
    for s in shown:
        hit = next((g for g in remaining if row_equal(s, g)), None)
        if hit is None:
            return False
        remaining.remove(hit)
    return not remaining


def _align(shown: list, rows: list) -> list:
    """Pair rows by first cell so one bad value is reported against the right row."""
    by_key = {str(g[0]): g for g in rows}
    paired = [(s, by_key[s[0].strip()]) for s in shown if s[0].strip() in by_key]
    return paired or list(zip(shown, rows))


def _cell_finding(col: str, shown: str, gold) -> dict:
    where = f"Column '{col}'"
    if gold is None:
        return finding("null_mismatch", f"{where}: a NULL is displayed as a value.", shown, "null")
    if isinstance(gold, (int, float)):
        n = parse_number(shown)
        if looks_like_other_locale(shown):
            return finding("format_mismatch", f"{where}: number uses the wrong locale format.", shown, gold)
        if n is not None and abs(n - gold) < 1 and n == round(n):
            return finding("precision_mismatch", f"{where}: decimals were lost.", shown, gold)
    return finding("value_mismatch", f"{where}: displayed value differs.", shown, expected_text(gold))


def check_row_badge(screen: dict, gold: dict) -> list:
    m = re.match(r"(\d+)", screen.get("rowBadge") or "")
    if m and int(m.group(1)) != len(gold["rows"]):
        return [finding("count_mismatch", "Row-count badge disagrees with the data.", int(m.group(1)), len(gold["rows"]))]
    return []


def check_summary(screen: dict, gold: dict) -> list:
    """Every number in the prose must come from the query result."""
    valid = {round(float(v), 4) for row in gold["rows"] for v in row if isinstance(v, (int, float))}
    valid.add(float(len(gold["rows"])))
    for raw in re.findall(r"\d[\d,]*(?:\.\d+)?", screen.get("explanation") or ""):
        if round(float(raw.replace(",", "")), 4) not in valid:
            return [finding("summary_mismatch", "The written summary quotes a number not in the data.", raw)]
    return []


def check_chart(screen: dict, gold: dict) -> list:
    """Bars start at zero, so width ratios must match value ratios."""
    bars = (screen.get("chart") or {}).get("bars") or []
    if not bars:
        return []
    numeric = [i for i in range(len(gold["columns"])) if all(isinstance(r[i], (int, float)) for r in gold["rows"])]
    if not numeric or len(bars) != len(gold["rows"]):
        return []
    values = [abs(r[numeric[-1]]) for r in gold["rows"]]
    top_value, top_width = max(values), max(b["width"] for b in bars)
    if not top_value or not top_width:
        return []
    for bar, value in zip(bars, values):
        if abs(bar["width"] / top_width - value / top_value) > CHART_TOLERANCE:
            return [finding("chart_mismatch", "A bar's length does not match its value.", round(bar["width"] / top_width, 3), round(value / top_value, 3))]
    return []


def grade(screen: dict, gold: dict, ordered: bool = False, previous: dict | None = None) -> dict:
    table = check_table(screen, gold, ordered, previous)
    if table and table[0]["kind"] == "stale_answer":
        return {"verdict": "fail", "findings": table}  # the rest of the page is stale too
    findings = table + check_row_badge(screen, gold) + check_summary(screen, gold) + check_chart(screen, gold)
    return {"verdict": "fail" if findings else "pass", "findings": findings}


def kinds(results: list) -> Counter:
    return Counter(f["kind"] for r in results for f in r["findings"])
