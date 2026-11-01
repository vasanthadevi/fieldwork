import { expect, test } from 'vitest'
import type { Box, Finding, Trace } from '@/lib/schema'
import { isHit } from './Stage'
import { checkAt, firstFailure } from './useReplay'

const trace = {
  steps: [
    { kind: 'tool', at_ms: 1 },
    { kind: 'verdict', at_ms: 2, check: 0, verdict: 'pass' },
    { kind: 'tool', at_ms: 3 },
    { kind: 'verdict', at_ms: 4, check: 1, verdict: 'fail' },
  ],
} as unknown as Trace

test('cursor maps to the latest finished check', () => {
  expect(checkAt(trace, 0)).toBe(0)
  expect(checkAt(trace, 2)).toBe(0)
  expect(checkAt(trace, 3)).toBe(1)
})

test('replay opens on the first failure', () => {
  expect(firstFailure(trace)).toBe(3)
})

test('findings highlight the matching element', () => {
  const box = (sel: string, label: string) => ({ sel, label, x: 0, y: 0, w: 0, h: 0 }) as Box
  const finding = { kind: 'value_mismatch', detail: '', shown: '42', expected: 1 } as Finding
  expect(isHit(box('td', '42'), [finding])).toBe(true)
  expect(isHit(box('td', '7'), [finding])).toBe(false)
  expect(isHit(box('[data-testid=explanation]', 'x'), [{ ...finding, kind: 'summary_mismatch' }])).toBe(true)
})
