# Fieldwork

**The SQL was right. Is the screen?**

Fieldwork is a QA agent for natural-language analytics apps. Through Playwright MCP it asks business questions in a
real browser, reads what the user actually sees, and checks every table cell, chart bar, row count and written summary
against gold SQL results from the database. A replay site shows each run, with the page and the agent's view side by side.

**[Watch the recorded runs](https://vasanthadevi.github.io/fieldwork/)** · [Evaluation report](evals/REPORT.md)

## How it works

Fieldwork answers one question: **does what the user sees match what the database says?** A text-to-SQL app can write
the right query and still show a rounded number, lose a row, or draw a chart that disagrees with its table.

```mermaid
flowchart LR
    Q[Business question] --> D[Driver<br/>script or Claude]
    D -->|browser tools| MCP[Playwright MCP]
    MCP --> B[Real Chromium]
    B --> APP[Analytics app<br/>under test]
    B -->|rendered table, chart, summary| V[Verdict engine<br/>plain Python]
    Q --> G[Gold SQL]
    G --> DB[(Chinook<br/>PostgreSQL)]
    DB -->|expected rows| V
    V --> T[Run trace<br/>and screenshots]
    V --> S[Evaluation score]
    T --> R[Replay site]
    T --> P[Generated<br/>Playwright tests]
```

One mission, step by step:

```mermaid
sequenceDiagram
    participant Driver
    participant MCP as Playwright MCP
    participant App as App in Chromium
    participant Verdict as Verdict engine
    participant DB as PostgreSQL

    Driver->>MCP: Type the question and submit
    MCP->>App: Fill the input and press Enter
    App-->>MCP: Answer rendered on the page
    Driver->>MCP: Run the page extractor
    MCP-->>Driver: Table, row count, summary, bar widths
    Driver->>Verdict: Grade this screen
    Verdict->>DB: Run gold SQL as a read-only role
    DB-->>Verdict: Expected columns and rows
    Verdict-->>Driver: Pass, or fail with findings
    Driver->>MCP: Take a screenshot as evidence
```

| Part | File | What it does |
|---|---|---|
| Questions | `fieldwork/cases.py` | Eight business questions, each with hand-written gold SQL |
| Scripted driver | `fieldwork/mission.py` | Asks every question in a fixed order, with no AI |
| Claude driver | `fieldwork/agent.py` | Claude picks from an allow-list of browser tools; code still grades |
| Page reader | `fieldwork/extract.js` | Reads what is rendered, including measured chart bar widths |
| Verdict engine | `fieldwork/verdict.py` | Compares the screen with the gold rows and names each failure |
| Evaluation | `evals/` | Runs the clean app and ten seeded bugs, then writes the score |
| Test generator | `fieldwork/gen_tests.py` | Turns a verified clean run into Playwright tests that need no AI |
| Target app | `target/` | The Analytics Copilot client, with bugs enabled by `?bug=<id>` |
| Replay site | `web/` | Static React site that plays back recorded runs |

The target's API answers from gold SQL, so scores measure the display layer rather than the model's SQL.

Three containers run the project:

```mermaid
flowchart LR
    subgraph compose[Docker Compose]
        F[fieldwork<br/>runs once, then exits] -->|read-only SQL| DB[(db<br/>PostgreSQL)]
        W[web<br/>nginx]
    end
    F -->|writes results to| H[Project folder<br/>evals, runs, generated]
    U[You] -->|localhost:8080| W
```

## Run it with Docker

You only need [Docker Desktop](https://www.docker.com/products/docker-desktop/) running. No API key is required.

**1. Get the code**

```bash
git clone https://github.com/vasanthadevi/fieldwork.git
```

```bash
cd fieldwork
```

**2. Build the images.** The first build takes a few minutes.

```bash
docker compose --profile run build
```

**3. Run the unit tests**

```bash
docker compose run --rm fieldwork python -m pytest
```

**4. Run the full evaluation.** This starts the database and takes about 5 minutes. It prints the score and writes
`evals/REPORT.md`, `evals/results.json` and `runs/`.

```bash
docker compose run --rm fieldwork
```

**5. Generate the Playwright tests and prove they work.** They must pass on the clean app and fail on a seeded bug.

```bash
docker compose run --rm fieldwork python -m fieldwork.gen_tests --verify
```

**6. Copy your new runs into the replay site**

```bash
docker compose run --rm fieldwork python scripts/export.py
```

**7. Start the replay site**

```bash
docker compose up -d --build web
```

Open <http://localhost:8080>, pick a run, then use the timeline and the slider between the browser and the agent's view.

**8. Stop everything and delete the database volume**

```bash
docker compose --profile run down -v
```

### Run a single mission

```bash
docker compose run --rm fieldwork python -m fieldwork.run --bug summary-wrong
```

Bug ids: `rounded-values`, `dropped-last-row`, `swapped-columns`, `reversed-order`, `null-as-zero`, `locale-decimal`,
`row-badge-off`, `summary-wrong`, `chart-wrong-scale`, `stale-answer`.

### Use the Claude driver

Create a `.env` file in the project folder containing `ANTHROPIC_API_KEY=your-key`, then run:

```bash
docker compose run --rm fieldwork python -m fieldwork.run --driver claude --bug summary-wrong
```

This uses paid API calls. Compose reads the key from `.env`, and it is never copied into an image.

## Run it without Docker

You need Python 3.12 or newer, Node 22 or newer, pnpm, and PostgreSQL.

**1. Create the database.** Create an empty `chinook` database, then load the two setup files.

```bash
createdb chinook
```

```bash
psql chinook -f docker/db/01-chinook.sql
```

```bash
psql chinook -f docker/db/02-readonly-role.sql
```

**2. Add a `.env` file** in the project folder:

```text
READONLY_DATABASE_URL=postgresql://copilot_readonly:readonly@localhost:5432/chinook
ANTHROPIC_API_KEY=
```

**3. Install dependencies**

```bash
python3 -m venv .venv
```

```bash
.venv/bin/pip install -r requirements.txt
```

```bash
npm install && npx playwright install chromium
```

```bash
cd target && npm install && cd ..
```

**4. Run the checks**

```bash
.venv/bin/python -m pytest
```

```bash
.venv/bin/python -m evals.evaluate
```

```bash
.venv/bin/python -m fieldwork.gen_tests --verify
```

```bash
.venv/bin/python scripts/export.py
```

**5. Start the replay site**

```bash
cd web && pnpm install && pnpm build && pnpm preview
```

Open the URL it prints. Press Ctrl+C to stop it.

## Limits

- Published scores use the scripted driver. The Claude driver is unit-tested with a fake client and has not yet run live.
- The bugs and the checker share an author, so scores show the method works and do not predict real-world recall.
- Test healing and exploration of unknown apps are not built yet.
