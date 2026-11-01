import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'

const ACCENT = '#3987e5' // validated series slot 1 (dark surface)

function formatNumber(v) {
  if (typeof v !== 'number') return v
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function ChartTooltip({ active, payload, measure }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  return (
    <div className="rounded-lg border border-hair bg-surface2 px-3 py-2 text-sm shadow-xl">
      <div className="text-ink2">{p.payload.label}</div>
      <div className="tnum font-semibold text-ink">
        {measure}: {formatNumber(p.value)}
      </div>
    </div>
  )
}

export default function ResultChart({ chart }) {
  const height = Math.max(200, chart.data.length * 34 + 32)
  return (
    <div style={{ width: '100%', height }} data-testid="result-chart">
      <ResponsiveContainer>
        <BarChart
          data={chart.data}
          layout="vertical"
          margin={{ top: 4, right: 28, bottom: 4, left: 4 }}
        >
          <CartesianGrid horizontal={false} stroke="#2c2c2a" />
          <XAxis
            type="number"
            tick={{ fill: '#898781', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#383835' }}
            tickFormatter={formatNumber}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={148}
            tick={{ fill: '#c3c2b7', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            content={<ChartTooltip measure={chart.measure} />}
          />
          <Bar dataKey="value" fill={ACCENT} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
