import { z } from 'zod/mini'

const Finding = z.object({
  kind: z.string(),
  detail: z.string(),
  shown: z.unknown(),
  expected: z.unknown(),
})
export type Finding = z.infer<typeof Finding>

const Box = z.object({
  sel: z.string(), x: z.number(), y: z.number(), w: z.number(), h: z.number(), label: z.string(),
})
export type Box = z.infer<typeof Box>

const Check = z.object({
  case: z.string(),
  question: z.string(),
  gold_sql: z.string(),
  verdict: z.enum(['pass', 'fail']),
  findings: z.array(Finding),
  screenshot: z.nullable(z.string()),
  screen: z.object({
    columns: z.array(z.string()),
    rows: z.array(z.array(z.string())),
    explanation: z.string(),
    rowBadge: z.string(),
    boxes: z.array(Box),
  }),
  gold: z.object({ columns: z.array(z.string()), rows: z.array(z.array(z.unknown())) }),
})
export type Check = z.infer<typeof Check>

const Step = z.object({
  kind: z.enum(['tool', 'note', 'verdict']),
  at_ms: z.number(),
  tool: z.optional(z.string()),
  note: z.optional(z.string()),
  text: z.optional(z.string()),
  source: z.optional(z.string()),
  case: z.optional(z.string()),
  verdict: z.optional(z.string()),
  check: z.optional(z.number()),
})
export type Step = z.infer<typeof Step>

export const Trace = z.object({
  id: z.string(),
  driver: z.string(),
  bug: z.nullable(z.string()),
  duration_ms: z.number(),
  steps: z.array(Step),
  checks: z.array(Check),
})
export type Trace = z.infer<typeof Trace>

export const Results = z.object({
  bugs_seeded: z.number(),
  bugs_caught: z.number(),
  clean_checks: z.number(),
  false_alarms: z.number(),
  questions: z.number(),
  driver: z.string(),
  bugs: z.array(z.object({
    bug: z.string(), expected: z.string(), caught: z.boolean(), failing_checks: z.number(),
  })),
})
export type Results = z.infer<typeof Results>
