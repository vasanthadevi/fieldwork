import { useState } from 'react'
import { askQuestion } from './api'
import QueryBar from './components/QueryBar'
import Results from './components/Results'
import { hasBug } from './bugs'

function Logo() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft ring-1 ring-inset ring-accent/30">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <ellipse cx="12" cy="5" rx="7" ry="3" stroke="#3987e5" strokeWidth="1.6" />
        <path d="M5 5v7c0 1.66 3.13 3 7 3s7-1.34 7-3V5" stroke="#3987e5" strokeWidth="1.6" />
        <path d="M5 12v7c0 1.66 3.13 3 7 3s7-1.34 7-3v-7" stroke="#5598e7" strokeWidth="1.6" opacity="0.6" />
      </svg>
    </div>
  )
}

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const ask = async (question) => {
    setLoading(true)
    setError(null)
    try {
      const data = await askQuestion(question)
      setResult((previous) => (hasBug('stale-answer') && previous ? previous : data))
    } catch (e) {
      setError(e.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-full max-w-3xl flex-col px-5 py-10">
      <header className="mb-8 flex items-center gap-3">
        <Logo />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-ink">Analytics Copilot</h1>
          <p className="text-xs text-muted">Ask in plain English · get SQL-backed answers</p>
        </div>
      </header>

      <QueryBar onAsk={ask} loading={loading} />

      <main className="mt-6">
        {error && (
          <div
            className="animate-rise rounded-xl border border-[#e66767]/30 bg-[#e66767]/10 px-4 py-3 text-sm text-[#e66767]"
            data-testid="error"
          >
            {error}
          </div>
        )}

        {!error && result && <Results result={result} />}

        {!error && !result && !loading && (
          <div className="mt-10 text-center text-sm text-muted">
            Try one of the examples above, or ask your own question.
          </div>
        )}
      </main>

      <footer className="mt-auto pt-10 text-center text-xs text-muted/70">
        Chinook dataset · read-only · schema retrieved with pgvector
      </footer>
    </div>
  )
}
