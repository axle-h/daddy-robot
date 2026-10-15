import { useEffect, useState } from 'react'
import { setMuted } from '../audio/sfx'
import { setSpeech } from '../audio/speech'
import { LEVELS } from '../levels/levels'
import { LevelSelect } from './LevelSelect'
import { Play } from './Play'
import { loadProgress, saveProgress, type Progress } from './progress'

export function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [levelIndex, setLevelIndex] = useState<number | null>(null)

  useEffect(() => {
    saveProgress(progress)
    setMuted(progress.muted)
    setSpeech(progress.speech)
  }, [progress])

  if (levelIndex === null) return <LevelSelect progress={progress} onProgress={setProgress} onPlay={setLevelIndex} />
  const next = levelIndex + 1 < LEVELS.length ? levelIndex + 1 : null
  return (
    <Play
      key={levelIndex}
      levelIndex={levelIndex}
      progress={progress}
      onProgress={setProgress}
      onHome={() => setLevelIndex(null)}
      onNext={() => setLevelIndex(next)}
      hasNext={next !== null}
    />
  )
}
