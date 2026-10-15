import type { Goal, World } from './types'
import { floorAt } from './world'

export function achieved(goal: Goal, world: World): boolean {
  const { robot } = world
  switch (goal.type) {
    case 'onThing':
      return world.things.some((t) => t.kind === goal.thing && t.pos.x === robot.pos.x && t.pos.y === robot.pos.y)
    case 'onFloor':
      return floorAt(world, robot.pos) === goal.floor
    case 'facing':
      return robot.facing === goal.dir
    case 'holding':
      return robot.holding?.kind === goal.thing
    case 'gave':
      return world.things.some((t) => t.kind === goal.to && t.given === goal.thing)
    case 'sitting':
      return robot.posture === 'sitting'
    case 'didNot':
      return !world.mishaps.includes(goal.mishap)
    case 'all':
      return goal.goals.every((g) => achieved(g, world))
  }
}
