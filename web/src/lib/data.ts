import { useQuery } from '@tanstack/react-query'
import { z } from 'zod/mini'
import { Results, Trace } from './schema'

async function load<S extends z.ZodMiniType>(path: string, schema: S): Promise<z.infer<S>> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Could not load ${path}`)
  return z.parse(schema, await res.json())
}

export const useResults = () =>
  useQuery({ queryKey: ['results'], queryFn: () => load('./data/results.json', Results) })

export const useTrace = (id: string) =>
  useQuery({ queryKey: ['trace', id], queryFn: () => load(`./data/runs/${id}/trace.json`, Trace) })

export const shotUrl = (runId: string, file: string) => `./data/runs/${runId}/${file}`
