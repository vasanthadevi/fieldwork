import { motion } from 'motion/react'
import type { Results } from '@/lib/schema'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-5">
      <div className="font-mono text-3xl font-medium text-teal">{value}</div>
      <div className="mt-1 text-sm text-ink-2">{label}</div>
    </div>
  )
}

export default function Hero({ results, failed }: { results?: Results; failed: boolean }) {
  return (
    <header>
      <p className="font-mono text-sm text-violet">Fieldwork · Playwright MCP</p>
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 max-w-4xl text-4xl leading-[1.05] font-bold tracking-tight sm:text-6xl"
      >
        The SQL was right. <span className="text-teal">Is the screen?</span>
      </motion.h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2">
        Text-to-SQL evals stop at the query. Fieldwork opens the real app in a real browser, reads what the user
        actually sees, and checks every cell, chart bar and summary against the database.
      </p>
      {failed && <p role="alert" className="mt-6 text-fail">Evaluation results could not be loaded.</p>}
      {results && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Stat value={`${results.bugs_caught}/${results.bugs_seeded}`} label="seeded display bugs caught" />
          <Stat value={String(results.false_alarms)} label={`false alarms in ${results.clean_checks} clean checks`} />
          <Stat value={String(results.questions)} label="business questions in each mission" />
        </div>
      )}
    </header>
  )
}
