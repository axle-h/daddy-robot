# Daddy Robot

A programming puzzle game for small people. Each level is a room with a job in it ("bring me the
biscuits", "sit on the sofa without waking the baby"). You build a program from command tiles, press
**RUN**, and Daddy Robot does exactly what you told him, which often isn't what you meant. Ponds get
fallen into, Lego gets stepped on, heads fall off. **RESET** puts everything back.

| Tile | Does |
|---|---|
| `FRWD` | step forwards |
| `BKWD` | step backwards |
| `LEFT` | turn left |
| `RGHT` | turn right |
| `PICK` | pick up what's here |
| `DROP` | put down what he's holding |
| `BEEP` | beep (things nearby react) |
| `DOWN` | sit down |
| `STUP` | stand up |

A static single-page app: React + TypeScript, built by Vite, no backend. Progress is kept in the
browser.

## Run

Node 22+ and pnpm (`corepack enable`).

```sh
pnpm install
pnpm dev                   # http://localhost:5173
pnpm build && pnpm preview # the production bundle
pnpm typecheck && pnpm lint && pnpm test
pnpm test:e2e              # Playwright, against the production build
```

Add `?all` to the URL to unlock every level.

## Deployed

<https://daddyrobot.ax-h.com>. The image `ghcr.io/axle-h/daddy-robot:latest` (nginx serving `dist/`) is
built by GitHub Actions on every push to `main`. See [`k8s/README.md`](k8s/README.md).

## Layout

```
src/engine   world model and interpreter: pure TS, no React or DOM
src/levels   level maps, goals and reference solutions
src/ui       React components; the board is SVG
src/audio    Web Audio sound effects, synthesised rather than sampled
k8s/         deployment, service, ingress
```
