import type { ThingKind } from '../types'
import type { ThingBehaviour } from './behaviour'
import { baby } from './baby'
import { banana } from './banana'
import { bins } from './bins'
import { biscuits } from './biscuits'
import { bottle } from './bottle'
import { cactus } from './cactus'
import { cat } from './cat'
import { dog } from './dog'
import { fishtank } from './fishtank'
import { flag } from './flag'
import { girl } from './girl'
import { hedgehog } from './hedgehog'
import { lego } from './lego'
import { pigeons } from './pigeons'
import { toast } from './toast'
import { toaster } from './toaster'
import { whoopee } from './whoopee'

export const THINGS: Record<ThingKind, ThingBehaviour> = {
  baby,
  banana,
  bins,
  biscuits,
  bottle,
  cactus,
  cat,
  dog,
  fishtank,
  flag,
  girl,
  hedgehog,
  lego,
  pigeons,
  toast,
  toaster,
  whoopee,
}
