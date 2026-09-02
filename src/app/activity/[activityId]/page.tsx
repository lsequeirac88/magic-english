'use client'
import { Suspense, useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Howl } from 'howler'
import { getWorldWords, getActivityOptions } from '@/lib/vocabulary'
import Character from '@/components/Character'
import { useMascot } from '@/hooks/useMascot'

function ActivityContent() {
  const { activityId } = useParams<{ activityId: string }>()
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const worldId = searchParams.get('world') || '1'
  const router = useRouter()
  const mascot = useMascot()

  const words = getWorldWords(worldId)
  const startIndex = words.findIndex(w => w.word === activityId)

  const [current, setCurrent] = useState(startIndex >= 0 ? startIndex : 0)
  const [stars, setStars] = useState(0)

  const target = words[current]
  const options = getActivityOptions(words, current)

  useEffect(() => {
    mascot.say('Escucha y toca la imagen correcta')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const playSound = (src: string) => new Howl({ src: [src] }).play()

  const handleAnswer = (word: string) => {
    const isCorrect = word === target.word
    playSound(isCorrect ? '/audio/correct.mp3' : '/audio/wrong.mp3')

    if (isCorrect) {
      mascot.celebrate()
      setStars(s => s + 1)
    } else {
      mascot.encourage()
    }

    setTimeout(() => {
      if (current + 1 < words.length) {
        setCurrent(c => c + 1)
      } else {
        saveProgress(isCorrect ? stars + 1 : stars)
      }
    }, 1500)
  }

  const saveProgress = async (finalStars: number) => {
    mascot.say('¡Terminaste el mundo! 🎉', undefined, 'happy')
    await fetch('/api/progress', {
      method: 'POST',
      body: JSON.stringify({ childId, worldId, activityId, stars: finalStars }),
    })
    setTimeout(() => {
      router.push(`/world/${worldId}?child=${childId}&completed=true`)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-yellow-50 flex flex-col items-center justify-center p-6 gap-8">
      <Character mood={mascot.mood} message={mascot.message} />

      <button onClick={() => playSound(target.audio)}>
        <div className="text-8xl">{target.emoji}</div>
        <p className="text-lg mt-2 text-center">🔊 Escucha</p>
      </button>

      <div className="flex gap-4">
        {options.map(o => (
          <button
            key={o.word}
            onClick={() => handleAnswer(o.word)}
            className="bg-white rounded-xl p-3 shadow active:scale-95 transition"
          >
            <div className="text-4xl">{o.emoji}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Cargando...</div>}>
      <ActivityContent />
    </Suspense>
  )
}