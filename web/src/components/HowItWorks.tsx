const POINTS = [
  ['AI operates, code grades', 'A model can drive the browser, but pass or fail always comes from deterministic comparison with gold SQL.'],
  ['Read the rendered page', 'Playwright MCP reads table cells, the row badge, the summary and the measured width of every chart bar.'],
  ['Leave tests behind', 'Verified answers become ordinary Playwright tests that run in CI with no AI at all.'],
]

export default function HowItWorks() {
  return (
    <section className="mt-16 grid gap-3 md:grid-cols-3" aria-label="How Fieldwork works">
      {POINTS.map(([title, body]) => (
        <div key={title} className="rounded-2xl border border-line bg-panel p-6">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-2">{body}</p>
        </div>
      ))}
      <p className="text-sm text-ink-2 md:col-span-3">
        Scores come from bugs seeded by the same author who wrote the checker, so they show the method works rather
        than predict real-world recall. The target is a demo copilot over the public Chinook dataset.
      </p>
    </section>
  )
}
