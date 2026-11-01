# Fieldwork

**The SQL was right. Is the screen?**

Fieldwork is a QA agent for natural-language analytics apps. Through Playwright MCP it asks business questions in a
real browser, reads what the user actually sees, and checks every table cell, chart bar, row count and written summary
against gold SQL results from the database. A replay site shows each run, with the page and the agent's view side by side.

See [evals/REPORT.md](evals/REPORT.md) for the current score.

## How it works

1. A driver operates the app through Playwright MCP: either a fixed script, or Claude choosing browser tools.
2. `fieldwork/extract.js` reads the rendered page, including measured chart bar widths.
3. `fieldwork/verdict.py` compares the screen with gold SQL. This is plain code, so the AI never grades itself.
4. `fieldwork/gen_tests.py` turns a verified clean run into ordinary Playwright tests that need no AI.
5. `web/` replays recorded runs as a static site.

The target in `target/` is the Analytics Copilot client with ten display bugs behind `?bug=<id>`. Its fixture API answers
from gold SQL, so scores measure the display layer rather than the model's SQL.

## Run it

Needs local Postgres with the Chinook database and `READONLY_DATABASE_URL` in `.env`.

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
npm install && (cd target && npm install)
.venv/bin/python -m pytest
.venv/bin/python -m evals.evaluate
.venv/bin/python -m fieldwork.gen_tests --verify
.venv/bin/python scripts/export.py
```

```bash
cd web && pnpm install && pnpm build && pnpm preview
```

The Claude driver needs `ANTHROPIC_API_KEY` in `.env`:

```bash
.venv/bin/python -m fieldwork.run --driver claude --bug summary-wrong
```

## Limits

- Published scores use the scripted driver. The Claude driver is unit-tested with a fake client and has not yet run live.
- The bugs and the checker share an author, so scores show the method works and do not predict real-world recall.
- Test healing and exploration of unknown apps are not built yet.
