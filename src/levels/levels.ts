import type { Command, Goal, Level } from '../engine'

const on = (thing: 'flag'): Goal => ({ type: 'onThing', thing })
const all = (...goals: Goal[]): Goal => ({ type: 'all', goals })
const rep = (n: number, c: Command): Command[] => Array<Command>(n).fill(c)

const WALK: Command[] = ['FRWD', 'LEFT', 'RGHT', 'BKWD']
const HANDS: Command[] = [...WALK, 'PICK', 'DROP']
const ALL: Command[] = [...HANDS, 'BEEP', 'DOWN', 'STUP']

export const LEVELS: Level[] = [
  {
    id: 'walkies',
    title: 'Walkies',
    card: ['🤖', '➡️', '🚩'],
    intro: 'Walk me to the flag!',
    map: [
      '######', //
      '#>..F#',
      '######',
    ],
    goal: on('flag'),
    commands: ['FRWD'],
    solution: rep(3, 'FRWD'),
  },
  {
    id: 'round-the-bend',
    title: 'Round the bend',
    card: ['🤖', '↪️', '🚩'],
    intro: 'Round the corner to the flag!',
    map: [
      '######', //
      '#v####',
      '#.####',
      '#...F#',
      '######',
    ],
    goal: on('flag'),
    commands: ['FRWD', 'LEFT', 'RGHT'],
    solution: ['FRWD', 'FRWD', 'LEFT', 'FRWD', 'FRWD', 'FRWD'],
  },
  {
    id: 'reverse-parking',
    title: 'Reverse parking',
    card: ['🤖', '🔙', '🅿️'],
    intro: 'Park me in the garage, facing out!',
    ground: 'path',
    map: [
      '#########', //
      '###U#####',
      '###p#####',
      '###.#####',
      '#>......#',
      '#########',
    ],
    goal: all({ type: 'onFloor', floor: 'parking' }, { type: 'facing', dir: 'S' }),
    commands: WALK,
    solution: ['FRWD', 'FRWD', 'RGHT', 'BKWD', 'BKWD'],
  },
  {
    id: 'biscuit-delivery',
    title: 'Biscuit delivery',
    card: ['🍪', '➡️', '👧'],
    intro: 'Take the biscuits to the girl on the rug!',
    map: [
      '#######', //
      '#>.B..#',
      '#.....#',
      '#..__g#',
      '#######',
    ],
    legend: { g: { floor: 'rug', thing: 'girl' } },
    goal: { type: 'gave', thing: 'biscuits', to: 'girl' },
    commands: HANDS,
    solution: ['FRWD', 'PICK', 'FRWD', 'RGHT', 'FRWD', 'FRWD', 'LEFT', 'FRWD', 'DROP'],
  },
  {
    id: 'mind-the-pond',
    title: 'Mind the pond',
    card: ['🤖', '🚫', '🌊', '🚩'],
    intro: "Get to the flag. Don't fall in the pond!",
    ground: 'path',
    map: [
      '&&&&&&&', //
      '&>~~~F&',
      '&.....&',
      '&""""&&',
      '&&&&&&&',
    ],
    goal: on('flag'),
    commands: HANDS,
    solution: ['RGHT', 'FRWD', 'LEFT', ...rep(4, 'FRWD'), 'LEFT', 'FRWD'],
  },
  {
    id: 'lego-minefield',
    title: 'Lego minefield',
    card: ['🤖', '🚫', '🧱', '🚩'],
    intro: 'Get to the flag. Mind the Lego!',
    ground: 'rug',
    map: [
      '########', //
      '#.L..L.#',
      '#>LLLF.#',
      '#.....L#',
      '########',
    ],
    goal: on('flag'),
    commands: HANDS,
    solution: ['RGHT', 'FRWD', 'LEFT', ...rep(4, 'FRWD'), 'LEFT', 'FRWD'],
  },
  {
    id: 'pigeon-problem',
    title: 'Pigeon problem',
    card: ['📢', '🐦', '➡️', '🚩'],
    intro: 'Get past the pigeons to the flag!',
    ground: 'path',
    map: [
      '&&&&&&&&&', //
      '&""""&""&',
      '&>...P.F&',
      '&""""&""&',
      '&&&&&&&&&',
    ],
    goal: on('flag'),
    commands: [...HANDS, 'BEEP'],
    solution: ['FRWD', 'FRWD', 'BEEP', ...rep(4, 'FRWD')],
  },
  {
    id: 'under-the-table',
    title: 'Under the table',
    card: ['🪑', '🍪', '➡️', '👧'],
    intro: 'Get the biscuit from under the table, for the girl!',
    map: [
      '########', //
      '#...TTT#',
      '#>..TbT#',
      '#...TTT#',
      '#..G...#',
      '########',
    ],
    legend: { b: { floor: 'table', thing: 'biscuits' } },
    goal: { type: 'gave', thing: 'biscuits', to: 'girl' },
    commands: ALL,
    solution: ['FRWD', 'FRWD', 'DOWN', 'FRWD', 'PICK', 'BKWD', 'STUP', 'RGHT', 'FRWD', 'DROP'],
  },
  {
    id: 'banana-boulevard',
    title: 'Banana boulevard',
    card: ['🍌', '💨', '🚩'],
    intro: 'Slide to the flag on the banana. Watch out for the fish tank!',
    ground: 'tiles',
    map: [
      '##########', //
      '#>N.....Q#',
      '#........#',
      '#.......F#',
      '##########',
    ],
    goal: on('flag'),
    commands: ALL,
    solution: ['PICK', 'RGHT', 'FRWD', 'FRWD', 'LEFT', 'DROP', 'FRWD'],
  },
  {
    id: 'shhh',
    title: 'Shhh!',
    card: ['🍼', '➡️', '👶', '🤫'],
    intro: "Shhh! Take the bottle to the baby. Don't wake her up!",
    ground: 'rug',
    map: [
      '########', //
      '#>.O...#',
      '#......#',
      '#..LZ..#',
      '########',
    ],
    goal: { type: 'gave', thing: 'bottle', to: 'baby' },
    commands: ALL,
    solution: ['FRWD', 'PICK', 'FRWD', 'FRWD', 'RGHT', 'FRWD', 'DROP'],
  },
  {
    id: 'sleeping-dogs',
    title: 'Let sleeping dogs lie',
    card: ['🍪', '➡️', '👧', '🤫', '🐕'],
    intro: "Take the biscuits to the girl. Don't wake the dog!",
    map: [
      '#########', //
      '#>B.#...#',
      '#...D..G#',
      '#.....u.#',
      '#########',
    ],
    goal: { type: 'gave', thing: 'biscuits', to: 'girl' },
    commands: ALL,
    solution: ['PICK', 'RGHT', 'FRWD', 'FRWD', 'LEFT', ...rep(6, 'FRWD'), 'LEFT', 'DROP'],
  },
  {
    id: 'sparkys-toaster',
    title: "Sparky's toaster",
    card: ['🍞', '✋', '🚫', '💧'],
    intro: 'Get the toast. Stay out of the puddle!',
    ground: 'tiles',
    map: [
      '#######', //
      '#.....#',
      '#.[K[.#',
      '#..,..#',
      '#>....#',
      '#######',
    ],
    goal: { type: 'holding', thing: 'toast' },
    commands: ALL,
    solution: ['LEFT', ...rep(3, 'FRWD'), 'RGHT', 'FRWD', 'FRWD', 'RGHT', 'PICK'],
  },
  {
    id: 'picnic',
    title: 'Picnic',
    card: ['🤖', '🪑', '🧺'],
    intro: 'Sit down on the picnic blanket!',
    ground: 'grass',
    map: [
      '&&&&&&&&', //
      '&>..W.X&',
      '&.H.==.&',
      '&...==C&',
      '&&&&&&&&',
    ],
    goal: all({ type: 'onFloor', floor: 'blanket' }, { type: 'sitting' }),
    commands: ALL,
    solution: ['FRWD', 'FRWD', 'RGHT', 'FRWD', 'LEFT', 'FRWD', 'DOWN'],
  },
  {
    id: 'the-big-shop',
    title: 'The big shop',
    card: ['🛒', '🍪', '➡️', '👧'],
    intro: 'Fetch the biscuits from the shop, for the girl!',
    ground: 'tiles',
    map: [
      '#########', //
      '#>......#',
      '#%%%%%%.#',
      '#.......#',
      '#.%%%%%%#',
      '#B.....G#',
      '#########',
    ],
    goal: { type: 'gave', thing: 'biscuits', to: 'girl' },
    commands: ALL,
    solution: [
      ...rep(6, 'FRWD'),
      'RGHT',
      'FRWD',
      'FRWD',
      'RGHT',
      ...rep(6, 'FRWD'),
      'LEFT',
      'FRWD',
      'PICK',
      'FRWD',
      'LEFT',
      ...rep(5, 'FRWD'),
      'DROP',
    ],
  },
]
