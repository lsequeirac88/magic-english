'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { supabase } from '@/lib/supabase'
import worlds from '@/data/worlds.json'
import { GAMES } from '@/data/games'

type Child = { id: string; name: string; avatar: string }
type ProgressRow = { worldId: string; stars: number; completedAt: string }
type GameProgressRow = { gameId: string; score: number; total: number }

const MAX_STARS_PER_WORLD = 6

const AVATARS: Record<string, string> = {
  cat: '🐱', dog: '🐶', unicorn: '🦄', robot: '🤖', panda: '🐼', star: '🌟',
}

export default function Dashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('cat')
  const [progressByChild, setProgressByChild] = useState<Record<string, ProgressRow[]>>({})
  const [gameProgressByChild, setGameProgressByChild] = useState<Record<string, GameProgressRow[]>>({})
  const [isSubscribed, setIsSubscribed] = useState(false)
  const router = useRouter()

  const fetchChildren = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch(`/api/children?parentId=${user.id}`)
    setChildren(await res.json())

    const statusRes = await fetch(`/api/parent/status?parentId=${user.id}`)
    const statusData = await statusRes.json()
    setIsSubscribed(statusData.isSubscribed)
  }

  useEffect(() => { fetchChildren() }, [])

  useEffect(() => {
    children.forEach(async (child) => {
      const res = await fetch(`/api/progress?childId=${child.id}`)
      const data: ProgressRow[] = await res.json()
      setProgressByChild(prev => ({ ...prev, [child.id]: data }))
    })
  }, [children])

  useEffect(() => {
    children.forEach(async (child) => {
      const res = await fetch(`/api/game-progress?childId=${child.id}`)
      const data: GameProgressRow[] = await res.json()
      setGameProgressByChild(prev => ({ ...prev, [child.id]: data }))
    })
  }, [children])

  const addChild = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !name) return
    await fetch('/api/children', {
      method: 'POST',
      body: JSON.stringify({ name, parentId: user.id, avatar }),
    })
    setName('')
    fetchChildren()
  }

  const deleteChild = async (childId: string) => {
    const ok = confirm('¿Eliminar a este hijo/a y todo su progreso? Esta acción no se puede deshacer.')
    if (!ok) return
    await fetch(`/api/children/${childId}`, { method: 'DELETE' })
    fetchChildren()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const bestStarsPerWorld = (rows: ProgressRow[] = []) => {
    const best: Record<string, number> = {}
    rows.forEach(r => { best[r.worldId] = Math.max(best[r.worldId] || 0, r.stars) })
    return best
  }

  const totalStars = (rows: ProgressRow[] = []) => {
    const best = bestStarsPerWorld(rows)
    return Object.values(best).reduce((sum, s) => sum + s, 0)
  }

  const bestGameScores = (rows: GameProgressRow[] = []) => {
    const best: Record<string, { score: number; total: number }> = {}
    rows.forEach(r => {
      const currentPct = r.total ? r.score / r.total : 0
      const bestSoFar = best[r.gameId]
      const bestPct = bestSoFar ? bestSoFar.score / bestSoFar.total : -1
      if (currentPct > bestPct) best[r.gameId] = { score: r.score, total: r.total }
    })
    return best
  }

  const lastPlayed = (rows: ProgressRow[] = []) => {
    if (rows.length === 0) return null
    const latest = rows.reduce((a, b) => (a.completedAt > b.completedAt ? a : b))
    return new Date(latest.completedAt).toLocaleDateString('es-CR', { day: 'numeric', month: 'short' })
  }

  const weeklyData = (rows: ProgressRow[] = []) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const today = new Date()
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() - (6 - i))
      return d
    })
    return last7.map(d => {
      const dayLabel = days[d.getDay()]
      const stars = rows
        .filter(r => new Date(r.completedAt).toDateString() === d.toDateString())
        .reduce((sum, r) => sum + r.stars, 0)
      return { day: dayLabel, stars }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50">
        <header className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto">
        <h1 className="text-2xl font-extrabold text-purple-700">🪄 Panel de padres</h1>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-800">Inicio</a>
          <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">Cerrar sesión</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${isSubscribed ? 'bg-purple-100' : 'bg-white border border-gray-200'}`}>
          <div>
            <p className="font-bold">{isSubscribed ? '✨ Plan Premium activo' : 'Plan gratuito'}</p>
            <p className="text-sm text-gray-500">{isSubscribed ? 'Acceso a los 6 mundos' : 'Acceso a Magic Forest y Magic School'}</p>
          </div>
          {!isSubscribed && (
            <a href="/upgrade" className="bg-purple-600 text-white text-sm font-bold rounded-lg px-4 py-2 hover:bg-purple-700 transition">Mejorar plan</a>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-8">
          <p className="font-bold mb-3">Agregar hijo/a</p>
          <div className="flex gap-2 mb-3">
            {Object.entries(AVATARS).map(([key, emoji]) => (
              <button
                key={key}
                type="button"
                onClick={() => setAvatar(key)}
                className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center border-2 transition ${avatar === key ? 'border-purple-500 bg-purple-50' : 'border-transparent'}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Nombre del niño/a"
              className="border rounded-lg p-2 flex-1"
            />
            <button onClick={addChild} className="bg-green-500 text-white rounded-lg px-4 font-semibold hover:bg-green-600 transition">Agregar</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {children.map(child => {
            const rows = progressByChild[child.id] || []
            const best = bestStarsPerWorld(rows)
            const total = totalStars(rows)
            const maxTotal = worlds.length * MAX_STARS_PER_WORLD
            const last = lastPlayed(rows)
            const gameRows = gameProgressByChild[child.id] || []
            const bestGames = bestGameScores(gameRows)

            return (
              <div key={child.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{AVATARS[child.avatar] || '🐱'}</span>
                    <p className="font-bold text-lg">{child.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-500 font-bold text-sm">⭐ {total}/{maxTotal}</span>
                    <button onClick={() => deleteChild(child.id)} className="text-gray-300 hover:text-red-500 text-sm" title="Eliminar">✕</button>
                  </div>
                </div>
                {last && <p className="text-xs text-gray-400 mb-3">Última vez jugó el {last}</p>}

                <div className="space-y-2 mb-4">
                  {worlds.map(world => {
                    const stars = best[world.id] || 0
                    const pct = Math.round((stars / MAX_STARS_PER_WORLD) * 100)
                    const locked = !world.free && !isSubscribed
                    return (
                      <div key={world.id}>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>{world.emoji} {world.title} {locked && '🔒'}</span>
                          <span>{stars}/{MAX_STARS_PER_WORLD}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs text-gray-500 font-semibold">🎮 Juegos</p>
                  {GAMES.map(game => {
                    const entry = bestGames[game.id]
                    const pct = entry && entry.total ? Math.round((entry.score / entry.total) * 100) : 0
                    return (
                      <div key={game.id}>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5">
                          <span>{game.emoji} {game.title}</span>
                          <span>{entry ? `${entry.score}/${entry.total}` : '—'}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-pink-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Actividad esta semana</p>
                  <div style={{ width: '100%', height: 80 }}>
                    <ResponsiveContainer>
                      <BarChart data={weeklyData(rows)}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="stars" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a href={`/world?child=${child.id}`} className="flex-1 text-center bg-purple-600 text-white rounded-lg py-2 font-semibold hover:bg-purple-700 transition">
                    Mundos →
                  </a>
                  <a href={`/games?child=${child.id}`} className="flex-1 text-center bg-pink-500 text-white rounded-lg py-2 font-semibold hover:bg-pink-600 transition">
                    Juegos →
                  </a>
                </div>
              </div>
            )
          })}
        </div>

        {children.length === 0 && (
          <p className="text-center text-gray-400 mt-10">Agrega a tu primer hijo/a para empezar 🎈</p>
        )}
      </div>
    </div>
  )
}