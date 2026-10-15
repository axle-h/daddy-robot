import type { MishapId } from './types'

interface MishapSpec {
  /** Kaput ends the run; anything else is an oops and the run carries on. */
  kaput: boolean
  /** Loud enough to wake a sleeping baby two cells away. */
  loud: boolean
  say: string
}

export const MISHAPS: Record<MishapId, MishapSpec> = {
  bonk: { kaput: false, loud: true, say: 'BONK!' },
  splash: { kaput: true, loud: true, say: 'SPLOSH! Glub glub...' },
  ouch: { kaput: false, loud: true, say: 'OUCH! OUCH! OUCH!' },
  headBonk: { kaput: false, loud: true, say: 'BONK! My head!' },
  bins: { kaput: false, loud: true, say: 'CRASH! Stinky bins!' },
  tickle: { kaput: false, loud: false, say: 'Hee hee! Silly Daddy!' },
  woof: { kaput: false, loud: true, say: 'WOOF!' },
  flap: { kaput: false, loud: false, say: 'Flap flap flap!' },
  fishtank: { kaput: true, loud: true, say: 'CRASH! Glub glub...' },
  prickle: { kaput: false, loud: false, say: 'Ooh, prickly!' },
  pickNose: { kaput: false, loud: false, say: 'Nothing here... pick pick.' },
  juggle: { kaput: false, loud: true, say: 'Whoa whoa whoa!' },
  scratch: { kaput: false, loud: false, say: 'HISSS! Ow!' },
  tooHeavy: { kaput: false, loud: false, say: 'Nnnngh! Too heavy!' },
  zap: { kaput: true, loud: true, say: 'BZZZZZT!' },
  headOff: { kaput: false, loud: false, say: 'Whoops! My head!' },
  dogAte: { kaput: true, loud: false, say: 'CHOMP! Good boy...' },
  floatedAway: { kaput: true, loud: false, say: 'Bye bye...' },
  noRoom: { kaput: false, loud: false, say: 'No room!' },
  pffft: { kaput: false, loud: true, say: 'PFFFFFT!' },
  mrrow: { kaput: false, loud: true, say: 'MRROWW!' },
  yeowch: { kaput: false, loud: true, say: 'YEOWCH!' },
  legsInAir: { kaput: false, loud: true, say: 'Whoopsie daisy!' },
  neckBoing: { kaput: false, loud: false, say: 'BOING!' },
  babyWoke: { kaput: true, loud: true, say: 'WAAAAAH!' },
}
