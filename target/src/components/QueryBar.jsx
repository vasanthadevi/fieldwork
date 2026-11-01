import { useState } from 'react'

const EXAMPLES = [
  'Which country generates the most revenue?',
  'Top 5 best-selling artists by tracks sold',
  'How many tracks are in each genre?',
  'Which employee supports the most customers?',
]

export default function QueryBar({ onAsk, loading }) {
  const [value, setValue] = useState('')

  const submit = (q) => {
    const question = (q ?? value).trim()
    if (!question || loading) return
    onAsk(question)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 rounded-2xl border border-hair bg-surface p-2 shadow-2xl focus-within:border-accent/60 focus-within:ring-4 focus-within:ring-accent-soft transition">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything about the music store…"
          aria-label="Ask a question"
          data-testid="query-input"
          className="flex-1 bg-transparent px-4 py-3 text-[15px] text-ink placeholder:text-muted focus:outline-none"
        />
        <button
          onClick={() => submit()}
          disabled={loading || !value.trim()}
          data-testid="ask-button"
          className="flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-[spin_.7s_linear_infinite] rounded-full border-2 border-white/40 border-t-white" />
              Thinking
            </>
          ) : (
            'Ask'
          )}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setValue(ex)
              submit(ex)
            }}
            disabled={loading}
            className="rounded-full border border-hair bg-surface px-3 py-1.5 text-xs text-ink2 transition hover:border-accent/40 hover:text-ink disabled:opacity-40"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  )
}
