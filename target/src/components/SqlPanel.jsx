import { useState } from 'react'

const KEYWORDS =
  /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|LIMIT|HAVING|AS|AND|OR|NOT|IN|SUM|COUNT|AVG|MIN|MAX|DESC|ASC|WITH|DISTINCT|CASE|WHEN|THEN|ELSE|END)\b/gi

// Light keyword tinting — enough to read the query at a glance, no heavy parser.
function highlight(sql) {
  const parts = sql.split(KEYWORDS)
  return parts.map((part, i) =>
    KEYWORDS.test(part) ? (
      <span key={i} className="font-semibold text-accent">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

export default function SqlPanel({ sql }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-plane">
      <div className="flex items-center justify-between border-b border-hair bg-surface2 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Generated SQL
        </span>
        <button
          onClick={copy}
          className="rounded-md px-2 py-1 text-xs text-ink2 transition hover:bg-white/5 hover:text-ink"
        >
          {copied ? 'Copied ✓' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-ink2">
        <code data-testid="sql-code">{highlight(sql)}</code>
      </pre>
    </div>
  )
}
