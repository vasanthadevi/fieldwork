import clsx from 'clsx'
import type { Check } from '@/lib/schema'

function Grid({ title, columns, rows }: { title: string; columns: string[]; rows: unknown[][] }) {
  return (
    <div>
      <h4 className="mb-1 font-mono text-xs text-ink-2">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full font-mono text-[11px]">
          <thead className="bg-panel-2"><tr>{columns.map((c) => <th key={c} className="px-2 py-1 text-left font-medium">{c}</th>)}</tr></thead>
          <tbody>
            {rows.slice(0, 5).map((row, i) => (
              <tr key={i} className="border-t border-line">
                {row.map((cell, j) => <td key={j} className="max-w-[130px] truncate px-2 py-1 text-ink-2">{cell == null ? 'null' : String(cell)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function VerdictPanel({ check }: { check: Check }) {
  const fail = check.verdict === 'fail'
  return (
    <section aria-label="Verdict" className="space-y-4 rounded-2xl border border-line bg-panel p-4">
      <div>
        <span className={clsx('rounded-full px-2.5 py-1 font-mono text-xs font-medium', fail ? 'bg-fail text-bg' : 'bg-pass text-bg')}>
          {fail ? 'FAIL' : 'PASS'}
        </span>
        <p className="mt-3 text-sm">{check.question}</p>
      </div>
      {check.findings.map((f) => (
        <div key={f.kind} className="rounded-lg border border-fail p-3 text-sm">
          <div className="font-mono text-xs text-fail">{f.kind}</div>
          <p className="mt-1">{f.detail}</p>
          {f.shown != null && <p className="mt-1 font-mono text-xs text-ink-2">shown {JSON.stringify(f.shown)}{f.expected != null && ` · expected ${JSON.stringify(f.expected)}`}</p>}
        </div>
      ))}
      <Grid title="On screen" columns={check.screen.columns} rows={check.screen.rows} />
      <Grid title="Gold (database)" columns={check.gold.columns} rows={check.gold.rows} />
    </section>
  )
}
