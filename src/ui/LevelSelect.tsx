import { unlockAudio, SFX } from '../audio/sfx'
import { parseLevel, type Level } from '../engine'
import { LEVELS } from '../levels/levels'
import { Icon, Star } from './icons'
import { unlocked, type Progress } from './progress'
import { Robot } from './Robot'
import { FloorTile, TableTop, ThingSprite } from './sprites'

interface Props {
  progress: Progress
  onProgress: (update: (p: Progress) => Progress) => void
  onPlay: (index: number) => void
}

const MASCOT = { ...parseLevel(LEVELS[0]!).robot, facing: 'S' as const }

/** The level's starting room in miniature, so each card shows where you're going instead of a caption. */
function Preview({ level }: { level: Level }) {
  const world = parseLevel(level)
  const ground = level.ground ?? 'floor'
  return (
    <svg viewBox={`0 0 ${world.width * 100} ${world.height * 100}`} className="level-preview" aria-hidden>
      {world.floor.map((row, y) => row.map((kind, x) => <FloorTile key={`${x},${y}`} kind={kind} x={x} y={y} ground={ground} />))}
      {world.things.map((t) => (
        <g key={t.id} transform={`translate(${t.pos.x * 100} ${t.pos.y * 100})`}>
          <ThingSprite thing={t} />
        </g>
      ))}
      <g transform={`translate(${world.robot.pos.x * 100} ${world.robot.pos.y * 100})`}>
        <Robot robot={{ ...world.robot, facing: 'S' }} angle={180} mood="happy" stepKey={0} />
      </g>
      {world.floor.flatMap((row, y) => row.map((f, x) => (f === 'table' ? <TableTop key={`t${x},${y}`} x={x} y={y} rattle={false} /> : null)))}
    </svg>
  )
}

export function LevelSelect({ progress, onProgress, onPlay }: Props) {
  const total = LEVELS.reduce((n, l) => n + (progress.stars[l.id] ?? 0), 0)
  return (
    <div className="select">
      <header className="select-head">
        <svg viewBox="0 -20 100 115" className="mascot" aria-hidden>
          <Robot robot={MASCOT} angle={180} mood="happy" stepKey={0} animation="wave" />
        </svg>
        <div>
          <h1>Daddy Robot</h1>
          <div className="total">
            <Star lit /> {total}
          </div>
        </div>
        <div className="toggles">
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, speech: !p.speech }))} aria-label="Talking">
            <Icon name={progress.speech ? 'talk' : 'quiet'} />
          </button>
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, muted: !p.muted }))} aria-label="Sound">
            <Icon name={progress.muted ? 'mute' : 'sound'} />
          </button>
        </div>
      </header>
      <div className="level-grid">
        {LEVELS.map((l, i) => {
          const open = unlocked(progress, i)
          const got = progress.stars[l.id] ?? 0
          return (
            <button
              key={l.id}
              type="button"
              className={`level ${open ? '' : 'locked'} ${got ? 'done' : ''}`}
              disabled={!open}
              onClick={() => {
                unlockAudio()
                SFX.tap()
                onPlay(i)
              }}
              aria-label={`Level ${i + 1}: ${l.title}`}
            >
              <span className="level-frame">
                <Preview level={l} />
                {!open && <Icon name="lock" className="level-lock" />}
              </span>
              <span className="level-foot">
                <span className="level-num">{i + 1}</span>
                <span className="level-stars">
                  {[1, 2, 3].map((n) => (
                    <Star key={n} lit={n <= got} />
                  ))}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
