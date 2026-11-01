import { useTrace } from '@/lib/data'
import type { Trace } from '@/lib/schema'
import Stage from './Stage'
import StepFeed from './StepFeed'
import Timeline from './Timeline'
import VerdictPanel from './VerdictPanel'
import { checkAt, useReplay } from './useReplay'

function Loaded({ trace }: { trace: Trace }) {
  const replay = useReplay(trace)
  const check = trace.checks[checkAt(trace, replay.cursor)]
  if (!check) return <p className="text-ink-2">This run has no recorded checks.</p>

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[250px_minmax(0,1fr)_340px]">
        <StepFeed steps={trace.steps} cursor={replay.cursor} />
        <Stage runId={trace.id} check={check} />
        <VerdictPanel check={check} />
      </div>
      <Timeline trace={trace} {...replay} />
    </div>
  )
}

export default function Replay({ runId }: { runId: string }) {
  const trace = useTrace(runId)
  if (trace.isPending) return <div className="h-[520px] animate-pulse rounded-2xl bg-panel" aria-label="Loading run" />
  if (trace.isError) return <p role="alert" className="text-fail">This recorded run could not be loaded.</p>
  return <Loaded trace={trace.data} />
}
