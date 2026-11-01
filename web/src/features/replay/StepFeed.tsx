import clsx from 'clsx'
import type { Step } from '@/lib/schema'

function label(step: Step) {
  if (step.kind === 'verdict') return `${step.verdict === 'fail' ? 'Failed' : 'Passed'}: ${step.case}`
  if (step.kind === 'note') return step.text ?? ''
  return step.note || step.tool
}

export default function StepFeed({ steps, cursor }: { steps: Step[]; cursor: number }) {
  const visible = steps.slice(Math.max(0, cursor - 11), cursor + 1).reverse()
  return (
    <section aria-label="Steps" className="max-h-[600px] overflow-hidden rounded-2xl border border-line bg-panel p-4">
      <h3 className="mb-3 font-mono text-xs text-ink-2">Step {cursor + 1} of {steps.length}</h3>
      <ol className="space-y-3">
        {visible.map((step) => (
          <li key={`${step.at_ms}-${step.kind}`} className="border-l-2 border-line pl-3 first:border-teal">
            <div className={clsx('text-sm', step.verdict === 'fail' ? 'text-fail' : step.verdict === 'pass' ? 'text-pass' : 'text-ink')}>{label(step)}</div>
            {step.tool && <div className="mt-0.5 font-mono text-[11px] text-ink-2">{step.tool}</div>}
          </li>
        ))}
      </ol>
    </section>
  )
}
