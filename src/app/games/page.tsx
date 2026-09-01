'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { GAMES } from '@/data/games'

export default function GamesPage() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 p-6">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-sm text-gray-500 hover:text-gray-800">
        ← Volver al panel de padres
      </button>

      <h1 className="text-3xl font-extrabold text-center mb-2">🎮 English Games</h1>
      <p className="text-gray-500 text-center mb-10">Escoge un juego y practica mientras ganas puntos.</p>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
        {GAMES.map(game => (
          <div key={game.id} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100">
            <div className="text-4xl mb-3">{game.emoji}</div>
            <h3 className="font-bold text-lg mb-1">{game.title}</h3>
            <p className="text-sm text-gray-500 mb-4">{game.desc}</p>
            <button
              onClick={() => router.push(`/games/${game.id}?child=${childId}`)}
              className="bg-purple-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-purple-700 transition"
            >
              Jugar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}