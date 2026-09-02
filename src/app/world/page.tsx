'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import worlds from '@/data/worlds.json'
import Character from '@/components/Character'

function WorldSelectContent() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  const [completedWorlds, setCompletedWorlds] = useState<string[]>([])
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if (!childId) return
    fetch(`/api/progress?childId=${childId}`)
      .then(res => res.json())
      .then(data => {
        const ids = [...new Set(data.map((p: any) => p.worldId))]
        setCompletedWorlds(ids as string[])
      })
  }, [childId])

  useEffect(() => {
    const checkSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const res = await fetch(`/api/parent/status?parentId=${user.id}`)
      const data = await res.json()
      setIsSubscribed(data.isSubscribed)
    }
    checkSubscription()
  }, [])

  const handleSelect = (world: typeof worlds[0]) => {
    if (!world.free && !isSubscribed) {
      router.push('/upgrade')
      return
    }
    router.push(`/world/${world.id}?child=${childId}`)
  }

  return (
    <div className="min-h-screen bg-sky-50 p-6">
      <button onClick={() => router.push('/dashboard')} className="mb-4 text-sm">
        ← Volver al panel de padres
      </button>

      <div className="flex justify-center mb-6">
        <Character mood="idle" message="¡Elige un mundo para jugar!" />
      </div>

      <div className="grid grid-cols-2 gap-5 max-w-md mx-auto">
        {worlds.map((world, i) => {
          const locked = !world.free && !isSubscribed
          const completed = completedWorlds.includes(world.id)

          return (
            <motion.button
              key={world.id}
              onClick={() => handleSelect(world)}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 shadow-md ${world.color} ${locked ? 'opacity-60' : ''}`}
            >
              {locked && <span className="absolute top-2 right-2 text-lg">🔒</span>}
              {completed && <span className="absolute top-2 left-2 text-lg">⭐</span>}
              <div className="text-4xl mb-2">{world.emoji}</div>
              <p className="font-bold text-lg">{world.title}</p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default function WorldSelectPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Cargando...</div>}>
      <WorldSelectContent />
    </Suspense>
  )
}