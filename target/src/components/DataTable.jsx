import { hasBug } from '../bugs'

const isNumeric = (v) => typeof v === 'number' && Number.isFinite(v)

function formatCell(v) {
  if (v == null) return hasBug('null-as-zero') ? '0' : <span className="text-muted">null</span>
  if (isNumeric(v)) {
    if (hasBug('rounded-values')) return v.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (hasBug('locale-decimal')) return v.toLocaleString('de-DE', { maximumFractionDigits: 4 })
    return v.toLocaleString('en-US', { maximumFractionDigits: 4 })
  }
  return String(v)
}

export default function DataTable({ columns, rows: allRows }) {
  let rows = allRows
  if (hasBug('dropped-last-row') && rows.length > 1) rows = rows.slice(0, -1)
  if (hasBug('reversed-order')) rows = [...rows].reverse()
  const headers = hasBug('swapped-columns') ? [...columns].reverse() : columns

  return (
    <div className="max-h-[420px] overflow-auto rounded-xl border border-hair" data-testid="result-table">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface2">
          <tr>
            {headers.map((c) => (
              <th
                key={c}
                className="border-b border-hair px-4 py-2.5 text-left font-medium text-ink2 whitespace-nowrap"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02]">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`border-b border-hair/60 px-4 py-2 whitespace-nowrap ${
                    isNumeric(cell) ? 'tnum text-right text-ink' : 'text-ink2'
                  }`}
                >
                  {formatCell(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
