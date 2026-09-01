'use client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { getWorldWords, getWorldTitle } from '@/lib/vocabulary'
import worlds from '@/data/worlds.json'
import ActivityCard from '@/components/ActivityCard'
import Character from '@/components/Character'

export default function WorldPage() {
  const { worldId } = useParams<{ worldId: string }>()
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  const world = worlds.find(w => w.id === worldId)
  const words = getWorldWords(worldId)

  return (
    <div className="min-h-screen bg-sky-100 p-6">
      <button onClick={() => router.push(`/world?child=${childId}`)} className="mb-4 text-sm">
        ← Volver a mundos
      </button>

      <div className="flex justify-center mb-4">
        <Character mood="idle" message={`¡Bienvenido al mundo de ${world?.title}!`} />
      </div>

      <h1 className="text-3xl font-bold text-center mb-6">
        {world?.emoji} {getWorldTitle(worldId)}
      </h1>

      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {words.map(w => (
          <button
            key={w.word}
            onClick={() => router.push(`/activity/${w.word}?child=${childId}&world=${worldId}`)}
          >
            <ActivityCard {...w} />
          </button>
        ))}
      </div>
    </div>
  )
}