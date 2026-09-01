import { useState, useCallback } from 'react'
import { Howl } from 'howler'

type Mood = 'idle' | 'happy' | 'sad' | 'talking'

export function useMascot() {
  const [mood, setMood] = useState<Mood>('idle')
  const [message, setMessage] = useState<string>()

  const say = useCallback((text: string, audioSrc?: string, nextMood: Mood = 'talking') => {
    setMood(nextMood)
    setMessage(text)
    if (audioSrc) {
      const sound = new Howl({ src: [audioSrc] })
      sound.play()
      sound.on('end', () => setMood('idle'))
    } else {
      setTimeout(() => setMood('idle'), 2000)
    }
  }, [])

  const celebrate = useCallback(() => {
    setMood('happy')
    setMessage('¡Muy bien! ⭐')
    setTimeout(() => { setMood('idle'); setMessage(undefined) }, 1500)
  }, [])

  const encourage = useCallback(() => {
    setMood('sad')
    setMessage('¡Casi! Intenta de nuevo 💛')
    setTimeout(() => { setMood('idle'); setMessage(undefined) }, 1500)
  }, [])

  return { mood, message, say, celebrate, encourage }
}