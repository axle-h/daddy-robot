# Daddy Robot: plan

## Where things stand

- Done: Delivery steps 1–6. The engine, all 14 levels with reference solutions, every mishap in the
  table below except `flewOff` (see "Not built yet"), synthesised sound, robot babble, stars, the
  level select, dad jokes, the Dockerfile, `k8s/` and both workflows. It is public at
  `github.com/axle-h/daddy-robot` and deployed to `daddyrobot.ax-h.com`.
- Next: play-testing with her, then step 7 (loops). Level 14 is the one that wants them.
- `?all` on the URL unlocks every level, for grown-ups testing.
- Decided while building, where the plan below was silent or changed:
  - A table is a **floor** (`table`), not a thing, so biscuits can lie under it. A standing robot
    bonks his head going in; a sitting one scoots under.
  - `DROP` puts the thing in the cell **in front**: given to the girl or the cot if that's who is
    there, lost if it's water, at his feet if the front is blocked, and `noRoom` if both are.
  - `PICK` prefers something portable at his feet, then whatever is in front.
  - Small things (cat, cactus, hedgehog, whoopee cushion, Lego, food, flag) can be stood on; big
    ones (dog, cot, girl, pigeons, bins, fish tank, toaster) block, each with its own bump mishap.
  - A banana slide stops softly at walls, on the next thing lying in the way, or in water; sliding
    into the fish tank is kaput.
  - Loud mishaps (bonks, OUCH, PFFFT…) wake a sleeping baby within two cells, as does BEEP.
  - A woken dog walks to the nearest `basket`; biscuits that land next to an awake dog get eaten.
  - Stars: finished, no mishaps at all (😇), and a program no longer than the reference solution (✂️).
  - Daddy Robot babbles in Web Audio instead of using `speechSynthesis`: the devices' own voices
    sounded bad and differed everywhere. The words are only in the bubbles, so a recorded voice is
    the option if she needs lines read to her.
- Not built yet: wobbly things (jelly) and so `flewOff`; the doorbell/door; the "ideas to come back
  to" list; personalisation. The **Open questions** at the bottom are still open.
- The reference for conventions (deploy, CI, Dockerfile, CLAUDE.md style) is
  `/home/alex/projects/make-believe`.

## The game in one paragraph

A top-down grid room. Daddy Robot (moustache, tie, telescopic neck, very literal) stands at the
start. The player taps command tiles to build a program, which shows as a strip of tiles. Tapping a
tile in the strip removes it, and there is a clear button. **RUN** plays the program one tile at a
time and highlights the current tile. **RESET** puts the room and the robot back where they started.
The program is kept so it can be fixed. The level is won when the goal is true at the end of the
program. A win earns a celebration and a dad joke.

## World model

- Grid of cells. Each cell has a **floor** (`floor`, `wall`, `water`, `puddle`, `rug`…) and at most
  one **thing** (`biscuits`, `lego`, `banana`, `cat`, `dog`, `baby`, `pigeons`, `table`, `sofa`…).
- Robot: `pos`, `facing` (N/E/S/W), `posture` (`standing` | `sitting`), `holding` (a thing or
  nothing), plus a few silly-state flags (`dizzy`, `soggy`, `afro`).
- Things have small behaviours: the dog wakes on a beep, pigeons scatter, the baby cries, a banana
  slides you. Each is a pure function from world to world plus events, kept in one file per thing
  type in `src/engine/things/`.

### Engine contract

```ts
run(level: Level, program: Command[]): { trace: TraceStep[]; outcome: Outcome }
// TraceStep = { pc: number; events: WorldEvent[]; world: World }
// Outcome   = { kind: 'win' } | { kind: 'kaput'; mishap: MishapId } | { kind: 'incomplete' }
```

`WorldEvent` is the vocabulary the UI animates: `moved`, `turned`, `bonked`, `slid`, `picked`,
`dropped`, `beeped`, `sat`, `stood`, `said(text)`, `mishap(id)`, `thingReacted(...)`. Sound effects
are keyed off events too.

## Commands: the normal result and the mishap

| Cmd | Normal | Wrong time → mishap |
|---|---|---|
| `FRWD` | step forward | into a wall: **bonk**, dizzy stars (oops) · into water: **splash**, rusts, bubbles (kaput) · onto Lego: **OUCH**, hops about (oops) · onto a banana: **slides** until something stops him (mechanic) · standing, into a table: **bonks head** (oops) |
| `BKWD` | step backward | the same hazards, but he looks surprised because he didn't see them coming |
| `LEFT`/`RGHT` | turn 90° | holding something wobbly (jelly, tower of cups): it **flies off** (oops) |
| `PICK` | pick up the thing here or in front | nothing there: **picks his nose** (oops) · already holding something: tries to **juggle**, drops both (oops) · the cat: cat **scratches**, he drops it (oops) · toaster while standing in a puddle: **ZAP**, skeleton flash, afro (kaput) |
| `DROP` | put the held thing down | holding nothing: his **head falls off**, rolls, pops back on (oops) · biscuits next to the dog: **dog eats them** (kaput) · anything into water: **floats away** (kaput) |
| `BEEP` | beep: things within 2 cells react | pigeons **scatter** (clears the path) · dog **wakes and wanders** · doorbell or door **opens** if facing · baby **wakes and cries** (kaput on nap levels) |
| `DOWN` | sit; while sitting, `FRWD`/`BKWD` is a **bum-scoot** and fits under tables | whoopee cushion: **PFFFT** (oops) · the cat: **MRROWW**, cat flees (oops) · cactus: **YEOWCH**, launched one cell forward (oops) · already sitting: falls back, legs in air (oops) |
| `STUP` | stand up | under a table: **bonks head**, table rattles (oops) · already standing: **neck telescopes up**, looks around, boings back (oops) |

Running out of program before the goal is reached: he shrugs and says *"Does not compute?"*

Ideas to come back to: mud (stuck for one step), a trampoline (jumps one cell), a puddle (slides one
cell), a sprinkler, a revolving door, a Roomba that gets in the way.

## Goals

Small composable predicates: `at(cell)`, `holding(thing)`, `thingAt(thing, cell)`, `sitting`,
`sittingOn(thing)`, `beepedAt(thing)`, `didNot(mishap)`, combined with `all(...)`. Each level's goal
is shown as a picture card ("🍪 → 👧"), not as words.

## Levels

New ideas come in one at a time, and each level has a mishap that is very easy to stumble into.

1. **Walkies.** `FRWD` only. Three steps to the flag.
2. **Round the bend.** Adds `LEFT`/`RGHT`. An L-shaped hallway, and walls to bonk.
3. **Reverse parking.** Adds `BKWD`. Back him into the garage. Driving in forwards hits the bins.
4. **Biscuit delivery.** Adds `PICK`/`DROP`. Bring the biscuits to the girl on the rug.
5. **Mind the pond.** The garden path goes round a pond, and the shortcut goes straight in.
6. **Lego minefield.** You can walk across the Lego, and it's very funny. A star for finding the clean route.
7. **Pigeon problem.** Adds `BEEP`. Pigeons block the gate.
8. **Under the table.** Adds `DOWN`/`STUP`. A biscuit has rolled under the dining table, so scoot in,
   pick it up, scoot out. Standing up under there bonks his head.
9. **Banana boulevard.** A long room crossed fast with a banana slide. If you don't place it right,
   he slides into the fish tank.
10. **Shhh!** Take the bottle to the cot without beeping. The Lego next to the cot makes him shout
    OUCH, which wakes the baby.
11. **Let sleeping dogs lie.** The dog is asleep in the doorway. Beeping moves it, but it's guarding the biscuits.
12. **Sparky's toaster.** Get the toast, but stay out of the puddle (ZAP).
13. **Picnic.** Sit on the blanket. The whoopee cushion, the cactus and the hedgehog are all decoys.
14. **The big shop.** A long route through a supermarket. It's deliberately tedious, to set up loops.

Each level has up to three stars: completed, no mishaps, and within the par program length. Stars are
optional and never needed to move on. All levels after the first are unlocked as you finish the one
before.

## Later: beyond straight-line programs

1. **`LOOP n … ENDL`**: repeat a block (the tile carries a number you tap to change). Level 14 is
   the reason for it.
2. **Procedures**: a second program strip, `JUMP` to call it. This is what Robot Turtles does with
   its frog card.
3. **Sensors**: `IFWL` (if wall ahead) / `IFTH` (if thing here). Only if she's ready.
4. **Step mode**: run one tile at a time. Good for debugging, and kids love it.
5. **Level editor**: she builds rooms for Daddy (the real one) to solve. Share a level as a URL hash.

## UI

- Layout: the board fills the top. Below it is the program strip, then the palette, then a big
  **RUN** and **RESET**. Works in landscape on a tablet and in portrait on a phone.
- The robot is an SVG component with a face that changes: eyes, mouth, and swirls when dizzy. The
  speech bubble shows `said` text.
- Playback: about 600 ms per step by default, with a tortoise/hare speed toggle. Mishaps get their
  own longer animation.
- Sound: Web Audio synths. Beep, boing, splash (filtered noise), zap, pfffft, ouch (a pitch sweep),
  and a win fanfare. Speech bubbles come with robot babble: one sung bleep per syllable, the same
  tune every time for the same line. There's a mute toggle and a talking toggle.
- Progress lives in `localStorage` under one versioned key, and the game works if storage throws.

## Delivery

1. **Scaffold.** `pnpm create vite` (React + TS), vitest, oxlint, and scripts for `typecheck`,
   `lint` and `test`. An engine purity test.
2. **Engine.** World, parser for the ASCII map, interpreter, goals. Levels 1–4 with reference
   solutions, and the level suite green.
3. **Playable.** Board, palette, program strip, RUN/RESET, playback of traces. Levels 1–4 playable
   on a tablet.
4. **Mishaps and sound.** The full command/mishap table, all the sound effects, the speech bubble.
5. **Content.** Levels 5–14, stars, the level select, dad jokes.
6. **Ship.** See below.
7. **Loops**, then the rest of "Later" as she grows into it.

### Ship to k3s

This follows the pattern in `make-believe`:

- `Dockerfile`. The build stage is `node:22-alpine` + corepack pnpm → `pnpm build`. The runtime is
  `nginxinc/nginx-unprivileged:alpine` serving `dist/` on 8080. `nginx.conf` sends everything that
  isn't a file to `/index.html`, gives `/healthz` a 200, and caches hashed assets as `immutable` and
  `index.html` as `no-cache`.
- `k8s/daddy-robot/deployment.yml` + `service.yml`. One replica, non-root, `readOnlyRootFilesystem`
  with an `emptyDir` on `/tmp` for nginx, and probes on `/healthz`.
- `k8s/ingress.yml`. Traefik, `cert-manager.io/cluster-issuer: letsencrypt-production`, host
  `daddyrobot.ax-h.com`, TLS secret `daddy-robot-axh-com-tls`.
- `k8s/redirect-http-https.yml`. The Traefik middleware, referenced as
  `daddy-robot-redirect-http-https@kubernetescrd`, so the namespace must be `daddy-robot`.
- `.github/workflows/container.yml`. Build, then a smoke test run read-only and non-root (`/healthz`
  and `/` serve the app), then push `ghcr.io/axle-h/daddy-robot:{latest,sha}` on `main`. The package
  must be made public once.
- DNS: done. Alex has added the record for `daddyrobot.ax-h.com` and put it in the `ddns`
  `DOMAINS` list. If the certificate gets stuck at `READY False`, check DNS first, because
  cert-manager uses HTTP-01.
- `k8s/README.md` with the apply order: namespace → app → middleware → ingress.

## Open questions

- **How old is she, and does she read yet?** If not, the tiles lead with an icon and the four-letter
  code is secondary, and goals are pictures only (planned anyway). Optional spoken prompts might help.
- **Tablet or laptop?** It decides the default orientation and how big the tiles are.
- **Personalisation.** Use her name in the goals ("Bring the biscuits to ___")? It would be a
  setting stored locally.
