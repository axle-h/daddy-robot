import { Fragment, useEffect, useEffectEvent, useMemo, useRef, useState, type PointerEvent } from 'react'
import { SFX, playEvents, unlockAudio } from '../audio/sfx'
import { speak, stopSpeaking } from '../audio/speech'
import { parseLevel, run, stars, type Command, type Dir, type RunResult, type Stars, type TraceStep } from '../engine'
import { LEVELS } from '../levels/levels'
import { Board, DIR_ANGLE } from './Board'
import { Icon, Star } from './icons'
import { drop, without, type DragSource, type DropTarget } from './program'
import type { Progress } from './progress'
import type { Mood } from './Robot'
import { Tile } from './Tile'
import { useDrag } from './useDrag'

interface Props {
  levelIndex: number
  progress: Progress
  onProgress: (update: (p: Progress) => Progress) => void
  onHome: () => void
  onNext: () => void
  hasNext: boolean
}

const MAX_PROGRAM = 40

interface Running {
  result: RunResult
  program: Command[]
}

/** How long a step stays on screen before the next one. */
function stepMs(step: TraceStep, speed: number): number {
  let ms = 750
  for (const e of step.events) {
    if (e.type === 'mishap') ms = Math.max(ms, e.kaput ? 2600 : 1700)
    if (e.type === 'slid') ms = Math.max(ms, 600 + 160 * (Math.abs(e.to.x - e.from.x) + Math.abs(e.to.y - e.from.y)))
    if (e.type === 'launched' || e.type === 'beeped' || e.type === 'gave') ms = Math.max(ms, 1200)
    if (e.type === 'shrugged') ms = Math.max(ms, 1800)
  }
  return ms * speed
}

function moveMs(step: TraceStep | undefined, speed: number): number {
  const slid = step?.events.find((e) => e.type === 'slid')
  if (slid?.type === 'slid') return (Math.abs(slid.to.x - slid.from.x) + Math.abs(slid.to.y - slid.from.y)) * 150 * speed
  return 520 * speed
}

const turnBy = (from: Dir, to: Dir) => ((DIR_ANGLE[to] - DIR_ANGLE[from] + 540) % 360) - 180

export function Play({ levelIndex, progress, onProgress, onHome, onNext, hasNext }: Props) {
  const level = LEVELS[levelIndex]!
  const initial = useMemo(() => parseLevel(level), [level])
  const [program, setProgram] = useState<Command[]>(() => progress.programs[level.id] ?? [])
  const [running, setRunning] = useState<Running | null>(null)
  const [index, setIndex] = useState(-1)
  const [finished, setFinished] = useState(false)
  const [celebration, setCelebration] = useState<Stars | null>(null)
  const [runId, setRunId] = useState(0)
  const [nudge, setNudge] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)
  const binRef = useRef<HTMLButtonElement>(null)

  const result = running?.result
  const step = result && index >= 0 ? result.trace[index] : undefined
  const world = step?.world ?? initial
  const busy = running !== null && !finished
  const speed = progress.fast ? 0.55 : 1
  const previous = LEVELS[levelIndex - 1]
  const fresh = level.commands.filter((c) => previous && !previous.commands.includes(c))

  const angles = useMemo(() => {
    const out: number[] = []
    let a = DIR_ANGLE[initial.robot.facing]
    for (const s of result?.trace ?? []) {
      for (const e of s.events) if (e.type === 'turned') a += turnBy(e.from, e.to)
      out.push(a)
    }
    return out
  }, [result, initial])
  const angle = index >= 0 ? (angles[index] ?? 0) : DIR_ANGLE[initial.robot.facing]

  useEffect(() => {
    speak(level.intro)
    return stopSpeaking
  }, [level])

  useEffect(() => {
    onProgress((p) => ({ ...p, programs: { ...p.programs, [level.id]: program } }))
  }, [program, level.id, onProgress])

  useEffect(() => {
    if (!step) return
    playEvents(step.events)
    const said = step.events.findLast((e) => e.type === 'said')
    if (said?.type === 'said' && said.text !== 'BEEP BEEP!') speak(said.text)
  }, [step])

  const celebrate = useEffectEvent(({ result: won, program: ran }: Running) => {
    const earned = stars(level, ran, won)
    SFX.win()
    speak('Hooray!')
    setCelebration(earned)
    onProgress((p) => ({ ...p, stars: { ...p.stars, [level.id]: Math.max(p.stars[level.id] ?? 0, earned.count) } }))
  })

  // The playback clock: one trace step at a time.
  useEffect(() => {
    if (!result || !running || finished) return
    const delay = index < 0 ? 300 : stepMs(result.trace[index]!, speed)
    const timer = setTimeout(() => {
      if (index < result.trace.length - 1) return setIndex(index + 1)
      setFinished(true)
      if (result.outcome.kind === 'win') celebrate(running)
    }, delay)
    return () => clearTimeout(timer)
  }, [result, running, index, finished, speed])

  const reset = () => {
    stopSpeaking()
    setRunning(null)
    setIndex(-1)
    setFinished(false)
    setCelebration(null)
    setRunId((n) => n + 1)
  }

  const edit = (change: (p: Command[]) => Command[]) => {
    if (busy) return
    if (running) reset()
    setProgram((p) => change(p))
  }

  const start = () => {
    if (busy) return
    unlockAudio()
    stopSpeaking()
    setRunning({ result: run(level, program), program })
    setIndex(-1)
    setFinished(false)
    setCelebration(null)
    setRunId((n) => n + 1)
  }

  const full = program.length >= MAX_PROGRAM
  const { dragging, start: startDrag } = useDrag({
    strip: stripRef,
    bin: binRef,
    onTap: (source: DragSource) => {
      if (source.from === 'strip') return setNudge((n) => n + 1)
      if (full) return
      unlockAudio()
      SFX.tap()
      edit((p) => [...p, source.command])
    },
    onDrop: (source: DragSource, target: DropTarget) => {
      if (!target || (target.kind === 'bin' && source.from === 'palette')) return
      unlockAudio()
      if (target.kind === 'bin') SFX.untap()
      else SFX.tap()
      edit((p) => drop(p, source, target, MAX_PROGRAM))
    },
  })
  const grab = (source: DragSource) => (e: PointerEvent<HTMLElement>) => {
    if (busy || (source.from === 'palette' && full)) return
    startDrag(e, source)
  }

  // While dragging, the strip shows the program with the tile lifted out and a gap where it would land.
  const shown = dragging ? without(program, dragging.source) : program
  const gap =
    dragging?.target?.kind === 'strip'
      ? dragging.target.index
      : dragging?.source.from === 'strip' && dragging.target?.kind !== 'bin'
        ? dragging.source.index
        : -1

  const tileStates = useMemo(() => {
    const states: Record<number, 'oops' | 'kaput' | 'done' | 'current'> = {}
    if (!result) return states
    for (const s of result.trace.slice(0, index + 1)) {
      const m = s.events.find((e) => e.type === 'mishap')
      states[s.pc] = m?.type === 'mishap' ? (m.kaput ? 'kaput' : 'oops') : 'done'
    }
    if (step && busy && states[step.pc] === 'done') states[step.pc] = 'current'
    return states
  }, [result, index, step, busy])

  const mood: Mood = (() => {
    if (finished && result?.outcome.kind === 'win') return 'proud'
    const mishap = step?.events.find((e) => e.type === 'mishap')
    if (mishap?.type === 'mishap') return mishap.kaput || world.robot.dizzy ? 'dizzy' : 'shocked'
    if (step?.events.some((e) => e.type === 'shrugged')) return 'puzzled'
    if (world.kaput) return 'sad'
    return 'happy'
  })()

  const lost = finished && result?.outcome.kind !== 'win'

  return (
    <div className="play">
      <header className="bar">
        <button type="button" className="round" onClick={onHome} aria-label="Home">
          <Icon name="home" />
        </button>
        <div className="title">
          <span className="level-no">{levelIndex + 1}</span>
          <span className="title-words">
            <span className="title-text">{level.title}</span>
            <span className="title-goal">{level.intro}</span>
          </span>
        </div>
        <div className="toggles">
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, fast: !p.fast }))} aria-label="Speed">
            <Icon name={progress.fast ? 'fast' : 'slow'} />
          </button>
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, muted: !p.muted }))} aria-label="Sound">
            <Icon name={progress.muted ? 'mute' : 'sound'} />
          </button>
        </div>
      </header>

      <main className="board-wrap">
        <Board
          key={runId}
          world={world}
          ground={level.ground ?? 'floor'}
          goal={level.goal}
          events={step?.events ?? []}
          stepKey={index}
          angle={angle}
          mood={mood}
          moveMs={moveMs(step, speed)}
        />
      </main>

      <section className="strip" aria-label="Program">
        <div className={`strip-tiles ${dragging?.target?.kind === 'strip' ? 'over' : ''}`} ref={stripRef}>
          {shown.length === 0 && gap < 0 && <span className="strip-hint" />}
          {shown.map((c, i) => (
            <Fragment key={i}>
              {i === gap && <span className="tile-gap" />}
              <Tile
                command={c}
                small
                slot
                state={dragging ? undefined : tileStates[i]}
                disabled={busy}
                onPointerDown={grab({ from: 'strip', command: c, index: i })}
              />
            </Fragment>
          ))}
          {gap >= shown.length && <span className="tile-gap" />}
        </div>
        <button
          ref={binRef}
          type="button"
          className={`round clear ${dragging?.source.from === 'strip' ? 'ready' : ''} ${dragging?.target?.kind === 'bin' ? 'over' : ''}`}
          onClick={() => {
            SFX.untap()
            edit(() => [])
          }}
          disabled={busy || program.length === 0}
          aria-label="Clear the program"
        >
          <span key={nudge} className={nudge ? 'nudge' : undefined}>
            <Icon name="bin" />
          </span>
        </button>
      </section>

      <section className="controls">
        <div className="palette">
          {level.commands.map((c) => (
            <Tile key={c} command={c} isNew={fresh.includes(c)} disabled={busy || full} onPointerDown={grab({ from: 'palette', command: c })} />
          ))}
        </div>
        <div className="go">
          <button type="button" className="big run" onClick={start} disabled={busy} aria-label="Run">
            <Icon name="play" />
          </button>
          <button type="button" className={`big reset ${lost ? 'pulse' : ''}`} onClick={reset} aria-label="Reset">
            <Icon name="again" />
          </button>
        </div>
      </section>

      {dragging && (
        <div className={`drag-ghost ${dragging.target?.kind === 'bin' && dragging.source.from === 'strip' ? 'binning' : ''}`} style={{ left: dragging.x - dragging.grabX, top: dragging.y - dragging.grabY }}>
          <Tile command={dragging.source.command} small={dragging.source.from === 'strip'} />
        </div>
      )}

      {celebration && (
        <Celebration
          stars={celebration}
          onAgain={reset}
          onNext={hasNext ? onNext : onHome}
          onHome={onHome}
          last={!hasNext}
        />
      )}
    </div>
  )
}

function Celebration({ stars: s, onAgain, onNext, onHome, last }: { stars: Stars; onAgain: () => void; onNext: () => void; onHome: () => void; last: boolean }) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 37) % 100,
        delay: ((i * 7) % 12) / 10,
        colour: ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#a970ff'][i % 5],
        spin: (i * 53) % 360,
      })),
    [],
  )
  return (
    <div className="celebrate">
      {confetti.map((c, i) => (
        <span key={i} className="confetti" style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, background: c.colour, rotate: `${c.spin}deg` }} />
      ))}
      <div className="celebrate-card">
        <div className="stars">
          {[s.won, s.clean, s.short].map((got, i) => (
            <div key={i} className={`star ${got ? 'got' : ''}`} style={{ animationDelay: `${0.3 + i * 0.35}s` }}>
              <Star lit={got} />
            </div>
          ))}
        </div>
        <div className="celebrate-buttons">
          <button type="button" className="big reset" onClick={onAgain} aria-label="Play again">
            <Icon name="again" />
          </button>
          <button type="button" className="big run" onClick={onNext} aria-label={last ? 'Home' : 'Next level'}>
            <Icon name={last ? 'home' : 'play'} />
          </button>
          {!last && (
            <button type="button" className="round" onClick={onHome} aria-label="Home">
              <Icon name="home" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
