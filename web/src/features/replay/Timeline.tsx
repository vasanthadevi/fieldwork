import type { Trace } from '@/lib/schema'

type Props = {
  trace: Trace; cursor: number; setCursor: (n: number) => void; playing: boolean; toggle: () => void; last: number
}

export default function Timeline({ trace, cursor, setCursor, playing, toggle, last }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
      <button onClick={toggle} className="rounded-lg bg-teal px-3 py-1.5 font-mono text-xs font-medium text-bg">
        {playing ? 'Pause' : 'Play'}
      </button>
      <div className="relative flex-1">
        <input
          type="range" aria-label="Replay position" min={0} max={last} value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          className="relative z-10 w-full accent-[var(--teal)]"
        />
        <div className="pointer-events-none absolute inset-x-1 -bottom-1 h-1.5" aria-hidden="true">
          {trace.steps.map((s, i) => s.kind === 'verdict' && (
            <span key={i} className={`absolute size-1.5 rounded-full ${s.verdict === 'fail' ? 'bg-fail' : 'bg-pass'}`} style={{ left: `${(i / last) * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
