'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Character from '@/components/Character'

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ parentId: user.id, email: user.email }),
    })
    const { url } = await res.json()
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center gap-6 p-6 text-center">
      <Character mood="talking" message="¡Este mundo es especial! Pídele a mamá o papá que lo desbloquee 💜" />
      <h1 className="text-2xl font-bold">Desbloquea todos los mundos</h1>
      <p className="text-gray-600 max-w-sm">
        Con Magic English Premium tu hijo/a accede a todos los mundos, nuevas palabras cada mes y reportes detallados de progreso.
      </p>
      <p className="text-3xl font-bold text-purple-600">$4.99/mes</p>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-purple-500 text-white rounded-xl px-6 py-3 font-bold disabled:opacity-50"
      >
        {loading ? 'Cargando...' : 'Suscribirse ahora'}
      </button>
    </div>
  )
}