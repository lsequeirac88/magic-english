'use client'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Howl } from 'howler'
import { generateQuiz } from '@/lib/vocabulary'

export default function ListeningPage() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  const quiz = useMemo(() => generateQuiz(8), [])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)

  const item = quiz[current]

  const playAudio = () => {
    if (!item) return
    new Howl({ src: [item.question.audio] }).play()
  }

  useEffect(() => {
    playAudio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  const handleAnswer = (word: string) => {
    if (selected) return
    setSelected(word)
    const isCorrect = word === item.question.word
    const finalScore = score + (isCorrect ? 1 : 0)
    if (isCorrect) setScore(finalScore)

    setTimeout(() => {
      if (current + 1 < quiz.length) {
        setCurrent(c => c + 1)
        setSelected(null)
      } else {
        setFinished(true)
        fetch('/api/game-progress', {
          method: 'POST',
          body: JSON.stringify({ childId, gameId: 'listening', score: finalScore, total: quiz.length }),
        })
      }
    }, 900)
  }

  const closeGame = () => router.push(`/games?child=${childId}`)

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="text-6xl">{score >= quiz.length * 0.7 ? '🎉' : '💪'}</div>
        <h1 className="text-3xl font-extrabold">¡Terminaste!</h1>
        <p className="text-xl">Puntaje: {score} / {quiz.length}</p>
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button onClick={() => window.location.reload()} className="bg-purple-600 text-white rounded-xl px-6 py-3 font-bold">
            Jugar de nuevo
          </button>
          <button onClick={closeGame} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-bold">
            Volver a juegos
          </button>
          <button onClick={() => router.push('/dashboard')} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-bold">
            🏠 Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-700 text-lg" title="Volver al panel de padres">🏠</button>
            <button onClick={closeGame} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>
          <span className="text-sm font-semibold text-gray-500">
            Pregunta {current + 1} / {quiz.length}
          </span>
          <span className="text-sm font-bold text-purple-600">⭐ {score}</span>
        </div>

        <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 mb-6">
          <p className="text-gray-500 text-sm mb-4">Escucha y elige la imagen correcta</p>
          <button
            onClick={playAudio}
            className="bg-purple-100 text-purple-700 rounded-full w-20 h-20 text-4xl flex items-center justify-center mx-auto hover:bg-purple-200 transition"
          >
            🔊
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {item.options.map(opt => {
            const isSelected = selected === opt.word
            const isCorrectAnswer = opt.word === item.question.word
            const showResult = selected !== null

            let style = 'bg-white border border-gray-200'
            if (showResult && isCorrectAnswer) style = 'bg-green-100 border-green-400'
            else if (showResult && isSelected) style = 'bg-red-100 border-red-400'

            return (
              <button
                key={opt.word}
                onClick={() => handleAnswer(opt.word)}
                disabled={selected !== null}
                className={`rounded-xl p-6 flex flex-col items-center gap-2 transition ${style}`}
              >
                <span className="text-5xl">{opt.emoji}</span>
                {showResult && <span className="text-xs font-bold text-gray-500">{opt.word}</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}