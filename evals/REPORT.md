# Fieldwork evaluation

- Seeded bugs caught: **10/10**
- False alarms: **0** in 24 clean checks
- Driver: scripted (no LLM in this run)

The checker and the bugs were written by the same author, so this shows the method works; it is not an estimate of real-world recall.

| Bug | Expected finding | Caught | Failing checks | Other findings |
|---|---|---|---|---|
| rounded-values | precision_mismatch | yes | 3/8 | - |
| dropped-last-row | missing_row | yes | 6/8 | - |
| swapped-columns | column_mismatch | yes | 5/8 | - |
| reversed-order | order_mismatch | yes | 5/8 | - |
| null-as-zero | null_mismatch | yes | 1/8 | - |
| locale-decimal | format_mismatch | yes | 4/8 | value_mismatch |
| row-badge-off | count_mismatch | yes | 8/8 | - |
| summary-wrong | summary_mismatch | yes | 8/8 | - |
| chart-wrong-scale | chart_mismatch | yes | 4/8 | - |
| stale-answer | stale_answer | yes | 7/8 | chart_mismatch, column_mismatch, count_mismatch, summary_mismatch |
