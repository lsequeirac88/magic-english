'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const syncParent = async (id: string, userEmail: string) => {
    await fetch('/api/parent/sync', {
      method: 'POST',
      body: JSON.stringify({ id, email: userEmail }),
    })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return }
    if (data.user) await syncParent(data.user.id, data.user.email!)
    router.push(next)
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); return }
    if (data.user) await syncParent(data.user.id, data.user.email!)
    router.push(next)
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Acceso para padres</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <input
          type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)}
          className="border rounded-lg p-2"
        />
        <input
          type="password" placeholder="Contraseña" value={password}
          onChange={e => setPassword(e.target.value)}
          className="border rounded-lg p-2"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-blue-500 text-white rounded-lg p-2">
          Entrar
        </button>
        <button type="button" onClick={handleSignup} className="text-blue-500 text-sm">
          Crear cuenta
        </button>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}