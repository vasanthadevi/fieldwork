import { useEffect, useState } from 'react'
import type { Trace } from '@/lib/schema'

const STEP_MS = 380

/** The check to show at a cursor: the latest finished one, or the first while none has finished. */
export function checkAt(trace: Trace, cursor: number): number {
  let current = 0
  for (const step of trace.steps.slice(0, cursor + 1)) {
    if (step.kind === 'verdict' && step.check !== undefined) current = step.check
  }
  return current
}

export function firstFailure(trace: Trace): number {
  const index = trace.steps.findIndex((s) => s.kind === 'verdict' && s.verdict === 'fail')
  return index === -1 ? trace.steps.length - 1 : index
}

export function useReplay(trace: Trace) {
  const [cursor, setCursor] = useState(() => firstFailure(trace))
  const [playing, setPlaying] = useState(false)
  const last = trace.steps.length - 1

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      setCursor((c) => {
        if (c >= last) { setPlaying(false); return c }
        return c + 1
      })
    }, STEP_MS)
    return () => clearInterval(id)
  }, [playing, last])

  const toggle = () => {
    if (!playing && cursor >= last) setCursor(0)
    setPlaying(!playing)
  }

  return { cursor, setCursor, playing, toggle, last }
}
