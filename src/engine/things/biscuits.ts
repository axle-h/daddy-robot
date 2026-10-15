import type { ThingBehaviour } from './behaviour'

/** Dropped next to an awake dog they get eaten; that check lives in `commands.ts`, where things land. */
export const biscuits: ThingBehaviour = { walkable: true, portable: true }
