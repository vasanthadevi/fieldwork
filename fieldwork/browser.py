"""Thin recording layer over the Playwright MCP server."""

import base64
import json
import os
import re
import time
from contextlib import asynccontextmanager
from pathlib import Path

from mcp import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client

EXTRACT_JS = (Path(__file__).parent / "extract.js").read_text()
SERVER = StdioServerParameters(
    command="npx",
    args=["-y", "@playwright/mcp@0.0.83", "--headless", "--isolated",
          "--allowed-origins", "http://127.0.0.1:4400", "--viewport-size", "1180x900",
          *os.environ.get("MCP_EXTRA_ARGS", "").split()],
    env={**os.environ},
)


def result_text(result) -> str:
    return "\n".join(c.text for c in result.content if getattr(c, "type", None) == "text")


def parse_json_result(text: str):
    """browser_evaluate wraps its value in a markdown section."""
    m = re.search(r"### Result\n(?:```(?:json)?\n)?(.*?)(?:\n```)?(?:\n### |\Z)", text, re.S)
    return json.loads(m.group(1) if m else text)


class Browser:
    def __init__(self, session: ClientSession, trace):
        self.session = session
        self.trace = trace

    async def call(self, tool: str, note: str = "", **args):
        start = time.perf_counter()
        result = await self.session.call_tool(tool, args)
        text = result_text(result)
        if result.is_error:
            raise RuntimeError(f"{tool} failed: {text[:300]}")
        shown = {k: ("<extractor>" if k == "function" else v) for k, v in args.items()}
        self.trace.tool(tool, shown, note, (time.perf_counter() - start) * 1000)
        return result

    async def read_screen(self) -> dict:
        result = await self.call("browser_evaluate", "Read the rendered answer from the page", function=EXTRACT_JS)
        return parse_json_result(result_text(result))

    async def outline(self) -> str:
        return result_text(await self.call("browser_snapshot", "Capture the accessibility tree"))

    async def screenshot(self) -> bytes | None:
        result = await self.call("browser_take_screenshot", "Save visual evidence", type="jpeg", fullPage=True)
        for c in result.content:
            if getattr(c, "type", None) == "image":
                return base64.b64decode(c.data)
        return None


@asynccontextmanager
async def open_browser(trace):
    async with stdio_client(SERVER) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield Browser(session, trace)
