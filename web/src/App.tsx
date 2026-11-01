import { useState } from 'react'
import { useResults } from '@/lib/data'
import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import Replay from '@/features/replay/Replay'
import RunPicker from '@/features/replay/RunPicker'

export default function App() {
  const results = useResults()
  const [runId, setRunId] = useState('summary-wrong')

  return (
    <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-8 sm:py-14">
      <Hero results={results.data} failed={results.isError} />
      <main className="mt-12">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">Mission replay</h2>
          <p className="font-mono text-xs text-ink-2">Recorded run · scripted driver · real browser, real database</p>
        </div>
        {results.data && <RunPicker results={results.data} value={runId} onChange={setRunId} />}
        <Replay key={runId} runId={runId} />
      </main>
      <HowItWorks />
    </div>
  )
}
