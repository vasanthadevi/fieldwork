import asyncio
import json
from types import SimpleNamespace as NS

from fieldwork import agent
from fieldwork.cases import CASES
from fieldwork.trace import Trace


class FakeBrowser:
    def __init__(self):
        self.calls = []
        tool = NS(name="browser_type", description="type", input_schema={"type": "object", "$schema": "x"})
        hidden = NS(name="browser_evaluate", description="eval", input_schema={"type": "object"})

        async def list_tools():
            return NS(tools=[tool, hidden])

        async def call_tool(name, args):
            self.calls.append(name)
            return NS(content=[NS(type="text", text="ok")], is_error=False)

        self.session = NS(list_tools=list_tools, call_tool=call_tool)

    async def call(self, tool, note="", **args):
        self.calls.append(tool)

    async def read_screen(self):
        return {"columns": ["artists"], "rows": [["275"]], "explanation": "", "rowBadge": "1 row", "chart": None}

    async def screenshot(self):
        return None


def message(stop, *content):
    return NS(stop_reason=stop, content=list(content), usage=NS(input_tokens=10, output_tokens=5))


class FakeClient:
    def __init__(self, replies):
        self.requests = []
        self.replies = iter(replies)
        self.beta = NS(messages=NS(create=self.create))

    def create(self, **kw):
        self.requests.append(kw)
        return next(self.replies)


def test_loop_grades_in_code_and_blocks_other_tools(monkeypatch):
    monkeypatch.setattr(agent, "run_gold", lambda sql: {"columns": ["artists"], "rows": [[275]]})
    client = FakeClient([
        message("tool_use",
                NS(type="tool_use", id="1", name="browser_type", input={"text": "q"}),
                NS(type="tool_use", id="2", name="browser_evaluate", input={"function": "x"}),
                NS(type="tool_use", id="3", name="check_answer", input={"case_id": "artist-count"})),
        message("end_turn", NS(type="text", text="All good.")),
    ])
    browser, trace = FakeBrowser(), Trace("t", {})
    asyncio.run(agent.claude_mission(browser, trace, "http://x", client))

    names = [t["name"] for t in client.requests[0]["tools"]]
    assert names == ["browser_type", "check_answer"]
    results = client.requests[1]["messages"][2]["content"]
    assert [r["is_error"] for r in results] == [False, True, False]
    assert json.loads(results[2]["content"])["verdict"] == "pass"
    assert trace.checks[0]["case"] == "artist-count"
    assert "browser_evaluate" not in browser.calls


def test_brief_lists_every_case():
    assert all(c.id in agent.mission_brief() for c in CASES)
