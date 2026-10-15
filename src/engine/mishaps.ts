import type { MishapId } from './types'

interface MishapSpec {
  /** Kaput ends the run; anything else is an oops and the run carries on. */
  kaput: boolean
  /** Loud enough to wake a sleeping baby two cells away. */
  loud: boolean
  /** Said in turn from the run's seed, so the same mishap twice says something new. */
  say: readonly string[]
}

export const MISHAPS: Record<MishapId, MishapSpec> = {
  bonk: { kaput: false, loud: true, say: ['BONK!', 'Who put that wall there?', 'Seeing stars!', 'Hello, wall.', 'Ow! My beeper!'] },
  splash: { kaput: true, loud: true, say: ['SPLOSH! Glub glub...', "Robots can't swim! Glub...", 'Squeak... rusty...', 'Bubble bubble... uh oh.'] },
  ouch: { kaput: false, loud: true, say: ['OUCH! OUCH! OUCH!', 'Not the Lego!', 'Hop hop hop! Owie!', 'My poor robot toes!'] },
  headBonk: { kaput: false, loud: true, say: ['BONK! My head!', 'Should have ducked!', 'Ow! Silly table!', 'My poor moustache!'] },
  bins: { kaput: false, loud: true, say: ['CRASH! Stinky bins!', 'Pooey! Smelly!', 'Eww! Banana skins!', 'Pongy pongy bins!'] },
  tickle: { kaput: false, loud: false, say: ['Hee hee! Silly Daddy!', 'Tickle tickle!', 'Oops! Hello!', 'Beep boop, big cuddle!'] },
  woof: { kaput: false, loud: true, say: ['WOOF!', 'Nice doggy...', 'Woof to you too!', 'Sorry, doggy!'] },
  flap: { kaput: false, loud: false, say: ['Flap flap flap!', 'Coo coo! Shoo!', 'Feathers in my moustache!', 'Pigeon traffic jam!'] },
  fishtank: { kaput: true, loud: true, say: ['CRASH! Glub glub...', 'Hello, fishies!', 'I am a fish now. Glub.', 'Splish splash, fishies!'] },
  prickle: { kaput: false, loud: false, say: ['Ooh, prickly!', 'Spiky! Spiky!', 'Ow, pointy!', 'Not a cuddly one!'] },
  pickNose: { kaput: false, loud: false, say: ['Nothing here... pick pick.', 'Ooh, a bogey!', 'Pick pick... nope.', 'Just fluff in here.'] },
  juggle: { kaput: false, loud: true, say: ['Whoa whoa whoa!', 'Too many things!', "I can't juggle!", 'Butterfingers!'] },
  scratch: { kaput: false, loud: false, say: ['HISSS! Ow!', 'Kitty says no!', 'Ow, scratchy!', 'No cuddles, then!'] },
  tooHeavy: { kaput: false, loud: false, say: ['Nnnngh! Too heavy!', 'My arms are noodles!', 'Heave... ho... nope!', "It won't budge!"] },
  zap: { kaput: true, loud: true, say: ['BZZZZZT!', 'Ooh, tingly!', 'My moustache is fizzy!', 'Look at my hair!'] },
  headOff: { kaput: false, loud: false, say: ['Whoops! My head!', 'Has anyone seen my head?', 'Head off, head on!', 'Come back, head!'] },
  dogAte: { kaput: true, loud: false, say: ['CHOMP! Good boy...', 'My biscuits!', 'Crumbs! All gone!', 'Hey, those were for her!'] },
  floatedAway: { kaput: true, loud: false, say: ['Bye bye...', 'Come back!', 'Off it sails!', 'Ahoy... bye bye!'] },
  noRoom: { kaput: false, loud: false, say: ['No room!', 'Nowhere to put it!', 'Squash... nope!', 'Too full here!'] },
  pffft: { kaput: false, loud: true, say: ['PFFFFFT!', 'Excuse me!', "It wasn't me!", 'Pardon me!'] },
  mrrow: { kaput: false, loud: true, say: ['MRROWW!', 'Sorry, kitty!', 'That seat is taken!', 'Squishy cat!'] },
  yeowch: { kaput: false, loud: true, say: ['YEOWCH!', 'Ooh, my bum!', 'Spiky bottom!', 'Wheee! Ow!'] },
  legsInAir: { kaput: false, loud: true, say: ['Whoopsie daisy!', 'Legs up!', "I'm a beetle!", 'Upside down!'] },
  neckBoing: { kaput: false, loud: false, say: ['BOING!', 'Neck stretch!', 'Hello up there!', 'Boing boing!'] },
  babyWoke: { kaput: true, loud: true, say: ['WAAAAAH!', "Uh oh. Baby's awake!", 'Shh shh shh!', 'Oh no, the baby!'] },
}

/** Said when the program runs out before the goal holds. */
export const SHRUGS: readonly string[] = [
  'Does not compute?',
  'What now?',
  'Am I done?',
  'Hmm... now what?',
  'More tiles please!',
  'Beep? Boop?',
]

export const line = (lines: readonly string[], n: number): string => lines[n % lines.length]!
