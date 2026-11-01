// Decide whether a result set is chartable, and shape it for a bar chart.
// Rule: pick the last all-numeric column as the measure and the first
// non-numeric column as the dimension. Chart only for a readable number of rows.

const isNumeric = (v) => typeof v === 'number' && Number.isFinite(v)

export function buildChart(columns, rows) {
  if (!rows || rows.length === 0 || rows.length > 30) return null

  const n = columns.length
  let measureIdx = -1
  for (let c = n - 1; c >= 0; c--) {
    if (rows.every((r) => isNumeric(r[c]))) {
      measureIdx = c
      break
    }
  }

  let dimIdx = -1
  for (let c = 0; c < n; c++) {
    if (c === measureIdx) continue
    if (!rows.every((r) => isNumeric(r[c]))) {
      dimIdx = c
      break
    }
  }

  if (measureIdx === -1 || dimIdx === -1) return null

  const data = rows.map((r) => ({
    label: r[dimIdx] == null ? '—' : String(r[dimIdx]),
    value: r[measureIdx],
  }))

  return { dimension: columns[dimIdx], measure: columns[measureIdx], data }
}
