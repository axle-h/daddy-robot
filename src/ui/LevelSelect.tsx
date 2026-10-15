import { unlockAudio, SFX } from '../audio/sfx'
import { parseLevel } from '../engine'
import { LEVELS } from '../levels/levels'
import { unlocked, type Progress } from './progress'
import { Robot } from './Robot'

interface Props {
  progress: Progress
  onProgress: (update: (p: Progress) => Progress) => void
  onPlay: (index: number) => void
}

const MASCOT = { ...parseLevel(LEVELS[0]!).robot, facing: 'S' as const }

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
          <div className="total">⭐ {total}</div>
        </div>
        <div className="toggles">
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, speech: !p.speech }))} aria-label="Talking">
            {progress.speech ? '🗣️' : '🤐'}
          </button>
          <button type="button" className="round" onClick={() => onProgress((p) => ({ ...p, muted: !p.muted }))} aria-label="Sound">
            {progress.muted ? '🔇' : '🔊'}
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
              <span className="level-num">{i + 1}</span>
              <span className="level-card">{open ? l.card.filter((g) => g !== '➡️' && g !== '🤖').slice(0, 3).join('') : '🔒'}</span>
              <span className="level-stars">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= got ? 'lit' : ''}>
                    ★
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
