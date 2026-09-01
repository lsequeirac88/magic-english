'use client'
import { useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllWords } from '@/lib/vocabulary'
import { useRef } from 'react'

type Card = {
  id: string
  wordKey: string
  type: 'emoji' | 'word'
  content: string
  matched: boolean
}

function buildCards(pairCount = 8): Card[] {
  const all = getAllWords()
  const shuffledWords = [...all].sort(() => 0.5 - Math.random()).slice(0, pairCount)

  const cards: Card[] = shuffledWords.flatMap(w => [
    { id: `${w.word}-emoji`, wordKey: w.word, type: 'emoji' as const, content: w.emoji, matched: false },
    { id: `${w.word}-word`, wordKey: w.word, type: 'word' as const, content: w.word, matched: false },
  ])

  return cards.sort(() => 0.5 - Math.random())
}

export default function MemoryGamePage() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  const [cards, setCards] = useState<Card[]>(() => buildCards(8))
  const [flipped, setFlipped] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [busy, setBusy] = useState(false)
  const saved = useRef(false)

  const matchedCount = cards.filter(c => c.matched).length
  const finished = matchedCount === cards.length

  const closeGame = () => router.push(`/games?child=${childId}`)

  const handleFlip = (card: Card) => {
    if (busy || card.matched || flipped.includes(card.id)) return
    if (flipped.length === 2) return

    const nextFlipped = [...flipped, card.id]
    setFlipped(nextFlipped)

    if (nextFlipped.length === 2) {
      setBusy(true)
      setMoves(m => m + 1)
      const [firstId, secondId] = nextFlipped
      const first = cards.find(c => c.id === firstId)!
      const second = cards.find(c => c.id === secondId)!

      const isMatch = first.wordKey === second.wordKey && first.type !== second.type

      setTimeout(() => {
        if (isMatch) {
          setCards(prev => prev.map(c =>
            c.wordKey === first.wordKey ? { ...c, matched: true } : c
          ))
        }
        setFlipped([])
        setBusy(false)
      }, 700)
    }
  }

  const restart = () => {
    setCards(buildCards(8))
    setFlipped([])
    setMoves(0)
    setBusy(false)
  }

  if (finished) {
    if (finished && !saved.current) {
    saved.current = true
    const stars = moves <= 10 ? 3 : moves <= 14 ? 2 : 1
    fetch('/api/game-progress', {
      method: 'POST',
      body: JSON.stringify({ childId, gameId: 'memory', score: stars, total: 3 }),
    })
  }
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="text-6xl">🧩🎉</div>
        <h1 className="text-3xl font-extrabold">¡Completaste el juego!</h1>
        <p className="text-xl">Movimientos: {moves}</p>
        <div className="flex gap-3 mt-4">
          <button onClick={restart} className="bg-purple-600 text-white rounded-xl px-6 py-3 font-bold">
            Jugar de nuevo
          </button>
          <button onClick={closeGame} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-bold">
            Volver a juegos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={closeGame} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          <h1 className="font-bold text-lg">🧩 Memory Game</h1>
          <span className="text-sm font-semibold text-gray-500">Movimientos: {moves}</span>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => {
            const isFlipped = flipped.includes(card.id) || card.matched
            return (
              <button
                key={card.id}
                onClick={() => handleFlip(card)}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${
                  card.matched
                    ? 'bg-green-100 border-2 border-green-400'
                    : isFlipped
                      ? 'bg-white border-2 border-purple-300'
                      : 'bg-purple-500 text-transparent'
                }`}
              >
                {isFlipped ? card.content : '?'}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}