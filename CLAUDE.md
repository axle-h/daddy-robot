# Daddy Robot

A programming puzzle game for my daughter. The player builds a program from command tiles, presses
RUN, and Daddy Robot carries it out literally, mishaps included. Static SPA, deployed to my k3s at
`daddyrobot.ax-h.com`. `plan.md` holds the design and the level list, and its first section,
"Where things stand", says what's done and what's next. Read it before starting, and update it when
you finish a step.

## Rules of the road

- `src/engine` is pure and deterministic: no React, DOM, timers, `Math.random` or audio. A test
  enforces this. `run(level, program)` returns a **trace** (a list of events) plus an outcome. It
  never animates anything.
- The UI only plays traces back. It never decides what happened, so anything that happens on screen
  can be reproduced in a unit test.
- Every command has a defined result in every state. Using one at the wrong time gives a mishap, not
  an error or a no-op. Mishaps are either **oops** (funny, and the run continues) or **kaput** (funny,
  and the run stops). Neither one shames the player, and RESET always works.
- Levels are data: an ASCII map, a legend, a goal, the commands on offer and a reference solution.
  Adding a level never touches the engine unless it needs a new thing type.
- Only the commands a level offers appear in its palette. New commands come in one per level.
- Built for a child on a tablet: big touch targets, no typing, no reading needed. Every tile has an
  icon as well as its four-letter code, and nothing depends on hover or a keyboard.
- Silly is good. Gory, scary or real-world-unsafe is not: electrocution is a cartoon skeleton flash
  and an afro, and a fall into water ends in rust and bubbles.

## Decided, don't relitigate

pnpm; Vite; React + TypeScript; the board is React-rendered SVG, not canvas or a game engine;
synthesised Web Audio, not sample files; progress in `localStorage`, with no backend or accounts;
served as static files by `nginx-unprivileged`. Dependencies beyond `react`, `react-dom`, `vite`,
`@vitejs/plugin-react`, `typescript`, `vitest`, `oxlint` and `playwright` need asking first.

## Testing

`pnpm typecheck && pnpm lint && pnpm test`. Tests sit next to the code as `*.test.ts`. The level
suite runs every level's reference solution and requires it to win. Each mishap gets a test that
triggers it. Tests check the engine's trace and do not snapshot SVG.

## Keeping it tidy

- A comment earns its place by stating a constraint, in one or two sentences.
- README and CLAUDE.md stay slim; no history or dates.
