import type { Command, Goal, LegendEntry, Level } from './types'

/** A throwaway level for tests: just a map, with every command on offer. */
export function room(map: string[], legend: Record<string, LegendEntry> = {}, goal: Goal = { type: 'sitting' }): Level {
  return { id: 'test', title: 'test', intro: '', map, legend, goal, commands: [], solution: [] satisfies Command[] }
}
