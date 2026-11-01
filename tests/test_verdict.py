from fieldwork.verdict import grade, parse_number

GOLD = {"columns": ["country", "revenue"], "rows": [["USA", 523.06], ["Canada", 303.96]]}


def screen(rows=(("USA", "523.06"), ("Canada", "303.96")), columns=("country", "revenue"), **kw):
    return {"columns": list(columns), "rows": [list(r) for r in rows], "explanation": "USA leads with 523.06.",
            "rowBadge": "2 rows", "chart": None, **kw}


def only_kind(result):
    assert result["verdict"] == "fail"
    return result["findings"][0]["kind"]


def test_pass():
    assert grade(screen(), GOLD, ordered=True)["verdict"] == "pass"


def test_parse_number():
    assert parse_number("1,234.5") == 1234.5
    assert parse_number("1.234,5") is None


def test_precision():
    assert only_kind(grade(screen(rows=(("USA", "523.06"), ("Canada", "304"))), GOLD)) == "precision_mismatch"


def test_missing_row():
    assert only_kind(grade(screen(rows=(("USA", "523.06"),)), GOLD)) == "missing_row"


def test_order_only_when_ordered():
    flipped = (("Canada", "303.96"), ("USA", "523.06"))
    assert only_kind(grade(screen(rows=flipped), GOLD, ordered=True)) == "order_mismatch"
    assert grade(screen(rows=flipped), GOLD)["verdict"] == "pass"


def test_columns():
    assert only_kind(grade(screen(columns=("revenue", "country")), GOLD)) == "column_mismatch"


def test_locale():
    gold = {"columns": ["n"], "rows": [[1234.56]]}
    s = {"columns": ["n"], "rows": [["1.234,56"]], "explanation": "", "rowBadge": "1 row"}
    assert only_kind(grade(s, gold)) == "format_mismatch"


def test_null():
    gold = {"columns": ["name", "composer"], "rows": [["A", None]]}
    s = {"columns": ["name", "composer"], "rows": [["A", "0"]], "explanation": "", "rowBadge": "1 row"}
    assert only_kind(grade(s, gold)) == "null_mismatch"


def test_summary_badge_chart():
    assert only_kind(grade(screen(explanation="USA leads with 576."), GOLD)) == "summary_mismatch"
    assert only_kind(grade(screen(rowBadge="3 rows"), GOLD)) == "count_mismatch"
    bars = {"bars": [{"width": 100}, {"width": 90}]}
    assert only_kind(grade(screen(chart=bars), GOLD)) == "chart_mismatch"


def test_stale():
    prev = {"columns": GOLD["columns"], "rows": [["France", 195.1], ["Spain", 37.62]]}
    s = screen(rows=(("France", "195.1"), ("Spain", "37.62")))
    assert only_kind(grade(s, GOLD, previous=prev)) == "stale_answer"


def test_stale_beats_column_mismatch():
    prev = {"columns": ["n"], "rows": [["9"]]}
    s = {"columns": ["n"], "rows": [["9"]], "explanation": "", "rowBadge": "1 row"}
    result = grade(s, GOLD, previous=prev)
    assert [f["kind"] for f in result["findings"]] == ["stale_answer"]


def test_generator_refuses_failing_runs():
    import pytest
    from fieldwork.gen_tests import render

    with pytest.raises(ValueError):
        render({"checks": [{"case": "x", "verdict": "fail"}]})
