import clsx from 'clsx'
import type { Results } from '@/lib/schema'

export default function RunPicker({ results, value, onChange }: {
  results: Results; value: string; onChange: (id: string) => void
}) {
  const runs = [{ id: 'clean', label: 'clean app' }, ...results.bugs.map((b) => ({ id: b.bug, label: b.bug.replaceAll('-', ' ') }))]
  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Choose a recorded run">
      {runs.map((r) => (
        <button
          key={r.id}
          aria-pressed={value === r.id}
          onClick={() => onChange(r.id)}
          className={clsx(
            'rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
            value === r.id ? 'border-teal bg-panel-2 text-teal' : 'border-line text-ink-2 hover:text-ink',
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  )
}
