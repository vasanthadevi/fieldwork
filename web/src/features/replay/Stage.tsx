import { useState } from 'react'
import { shotUrl } from '@/lib/data'
import type { Box, Check, Finding } from '@/lib/schema'

const HIT_SELECTORS: Record<string, string[]> = {
  summary_mismatch: ['[data-testid=explanation]'],
  count_mismatch: ['[data-testid=row-count]'],
  chart_mismatch: ['.recharts-bar-rectangle path'],
  column_mismatch: ['th'],
  stale_answer: ['td'],
  order_mismatch: ['td'],
  missing_row: ['td'],
}

export function isHit(box: Box, findings: Finding[]): boolean {
  return findings.some((f) => {
    if (HIT_SELECTORS[f.kind]?.includes(box.sel)) return true
    return box.sel === 'td' && f.shown != null && box.label === String(f.shown)
  })
}

export default function Stage({ runId, check }: { runId: string; check: Check }) {
  const [split, setSplit] = useState(40)
  const page = check.screen.boxes
  const hasShot = Boolean(check.screenshot)

  return (
    <section aria-label="Browser view" className="overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 font-mono text-xs text-ink-2">
        <span>Real browser</span>
        <label className="flex flex-1 items-center gap-2">
          <span className="sr-only">Reveal the agent's view</span>
          <input type="range" min={0} max={100} value={split} onChange={(e) => setSplit(Number(e.target.value))} className="w-full accent-[var(--teal)]" />
        </label>
        <span className="text-teal">Agent's view</span>
      </div>
      <div className="relative max-h-[560px] overflow-y-auto bg-[oklch(0.13_0.01_268)]">
        <div className="relative">
          {hasShot && (
            <img src={shotUrl(runId, check.screenshot!)} alt={`Browser showing the answer to: ${check.question}`} className="block w-full" />
          )}
          <div
            key={check.case}
            aria-hidden="true"
            className="absolute inset-0 bg-[oklch(0.15_0.03_250/0.94)]"
            style={{ clipPath: `inset(0 0 0 ${split}%)` }}
          >
            {page.map((b, i) => {
              const hit = isHit(b, check.findings)
              return (
                <div
                  key={i}
                  className={`blueprint-box absolute truncate rounded-[2px] border font-mono text-[9px] leading-tight ${hit ? 'blueprint-hit border-[var(--fail)] bg-[oklch(0.7_0.17_22/0.25)] text-white' : 'border-[oklch(0.86_0.11_185/0.55)] text-[oklch(0.86_0.11_185/0.8)]'}`}
                  style={{ '--i': i, left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` } as React.CSSProperties}
                >
                  {b.label}
                </div>
              )
            })}
          </div>
          <div className="absolute inset-y-0 w-px bg-teal" style={{ left: `${split}%` }} aria-hidden="true" />
        </div>
      </div>
    </section>
  )
}
