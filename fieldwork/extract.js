async () => {
  const q = (s) => document.querySelector(s);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const waitFor = async (ok, ms = 8000) => {
    const end = Date.now() + ms;
    while (Date.now() < end) { if (ok()) return true; await sleep(60); }
    return false;
  };
  await sleep(80);
  await waitFor(() => !q('[data-testid=ask-button]')?.innerText.includes('Thinking'));
  await waitFor(() => q('[data-testid=result-table]') || q('[data-testid=error]'));
  let widths = '';
  await waitFor(() => {
    const now = [...document.querySelectorAll('.recharts-bar-rectangle path')]
      .map((p) => p.getBoundingClientRect().width.toFixed(1)).join();
    const same = now === widths; widths = now; return same && (now || !q('[data-testid=result-chart]'));
  }, 3000);
  await sleep(250);
  const text = (el) => (el?.innerText ?? '').trim();
  const table = q('[data-testid=result-table]');
  const chartEl = q('[data-testid=result-chart]');
  const vw = document.documentElement.clientWidth, vh = document.documentElement.scrollHeight;
  const nodes = ['h1', 'input', 'button', 'th', 'td', '[data-testid=explanation]', '[data-testid=row-count]',
    '[data-testid=result-chart]', '.recharts-bar-rectangle path', 'pre'];
  const boxes = [];
  for (const sel of nodes) for (const el of document.querySelectorAll(sel)) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    boxes.push({ kind: sel.replace(/\[.*|\..*/, '') || 'bar', sel,
      x: (r.x + scrollX) / vw, y: (r.y + scrollY) / vh, w: r.width / vw, h: r.height / vh,
      label: text(el).slice(0, 40) });
    if (boxes.length > 220) break;
  }
  return {
    error: text(q('[data-testid=error]')) || null,
    columns: table ? [...table.querySelectorAll('th')].map(text) : [],
    rows: table ? [...table.querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map(text)) : [],
    explanation: text(q('[data-testid=explanation]')),
    rowBadge: text(q('[data-testid=row-count]')),
    chart: chartEl ? { bars: [...chartEl.querySelectorAll('.recharts-bar-rectangle path')]
      .map((p) => ({ width: p.getBoundingClientRect().width })) } : null,
    boxes,
    page: { width: vw, height: vh },
  };
}
