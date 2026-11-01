import { buildChart } from '../lib/chart'
import ResultChart from './ResultChart'
import DataTable from './DataTable'
import SqlPanel from './SqlPanel'
import { hasBug } from '../bugs'

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-hair bg-surface p-5 ${className}`}>
      {children}
    </div>
  )
}

export default function Results({ result }) {
  const chart = buildChart(result.columns, result.rows)
  if (hasBug('chart-wrong-scale') && chart) {
    chart.data = chart.data.map((d, i) => (i === 0 ? { ...d, value: d.value / 2 } : d))
  }
  const explanation = hasBug('summary-wrong')
    ? result.explanation.replace(/\d[\d,]*(\.\d+)?/, (n) => String(Math.round(Number(n.replace(/,/g, '')) * 1.1 + 1)))
    : result.explanation
  const rowCount = result.row_count + (hasBug('row-badge-off') ? 1 : 0)

  return (
    <div className="animate-rise space-y-4">
      {/* Explanation + tables used */}
      <Card>
        {result.repaired && (
          <div
            data-testid="repaired-badge"
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs text-accent"
          >
            <span aria-hidden="true">↻</span>
            Self-corrected — the first query errored and was retried automatically
          </div>
        )}
        <p className="text-[15px] leading-relaxed text-ink" data-testid="explanation">
          {explanation}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted">Tables used:</span>
          {result.tables_used.map((t) => (
            <span
              key={t}
              className="rounded-md border border-hair bg-surface2 px-2 py-0.5 font-mono text-xs text-accent"
            >
              {t}
            </span>
          ))}
          <span className="ml-auto text-xs text-muted tnum">
            <span data-testid="row-count">{rowCount} row{rowCount === 1 ? '' : 's'}</span>
          </span>
        </div>
      </Card>

      {chart && (
        <Card>
          <h3 className="mb-3 text-sm font-medium text-ink2">
            {chart.measure} by {chart.dimension}
          </h3>
          <ResultChart chart={chart} />
        </Card>
      )}

      <DataTable columns={result.columns} rows={result.rows} />

      <SqlPanel sql={result.sql} />
    </div>
  )
}
