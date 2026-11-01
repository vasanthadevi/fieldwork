"""Each seeded bug and the finding kind that counts as catching it."""

BUGS = {
    "rounded-values": "precision_mismatch",
    "dropped-last-row": "missing_row",
    "swapped-columns": "column_mismatch",
    "reversed-order": "order_mismatch",
    "null-as-zero": "null_mismatch",
    "locale-decimal": "format_mismatch",
    "row-badge-off": "count_mismatch",
    "summary-wrong": "summary_mismatch",
    "chart-wrong-scale": "chart_mismatch",
    "stale-answer": "stale_answer",
}
CLEAN_REPEATS = 3
