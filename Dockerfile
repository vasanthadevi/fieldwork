# The checker: Python, Node, Chromium, Playwright MCP and the target app in one image.
FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-venv \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV MCP_EXTRA_ARGS="--browser chromium --no-sandbox" \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY requirements.txt package.json package-lock.json ./
RUN python3 -m venv .venv && .venv/bin/pip install --no-cache-dir -r requirements.txt \
    && npm ci \
    && npx playwright install --with-deps chromium \
    && npx -y @playwright/mcp@0.0.83 install-browser chromium

COPY target/package.json target/package-lock.json target/
RUN cd target && npm ci

COPY fieldwork fieldwork
COPY evals evals
COPY tests tests
COPY scripts scripts
COPY generated generated
COPY playwright.config.ts ./
COPY target target

ENV PATH="/app/.venv/bin:$PATH"
CMD ["python", "-m", "evals.evaluate"]
