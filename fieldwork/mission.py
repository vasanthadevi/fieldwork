"""The scripted driver: asks every question through Playwright MCP, then code grades the screen."""

from .browser import Browser
from .cases import CASES
from .gold import run_gold
from .verdict import grade


async def ask_and_grade(browser: Browser, trace, case, previous: dict | None, capture: bool) -> dict:
    await browser.call("browser_type", f"Ask: {case.question}", target="[data-testid=query-input]",
                       text=case.question, submit=True)
    screen = await browser.read_screen()
    gold = run_gold(case.gold_sql)
    graded = grade(screen, gold, case.ordered, previous)
    image = await browser.screenshot() if capture else None
    trace.check(case, screen, gold, graded, image)
    return gold


async def scripted_mission(browser: Browser, trace, url: str, capture: bool = True) -> None:
    await browser.call("browser_navigate", "Open the analytics app", url=url)
    if capture:
        trace.meta["outline"] = await browser.outline()
    previous = None
    for case in CASES:
        previous = await ask_and_grade(browser, trace, case, previous, capture)
