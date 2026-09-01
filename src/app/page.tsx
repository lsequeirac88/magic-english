'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import worlds from '@/data/worlds.json'

const features = [
  { emoji: '🎯', title: 'Aprende jugando', text: 'Actividades de 2-3 minutos pensadas para niños de 5 a 7 años.' },
  { emoji: '🛡️', title: '100% seguro', text: 'Sin publicidad, sin chats, sin compras accidentales. Control total para los padres.' },
  { emoji: '📊', title: 'Progreso real', text: 'Ve cuánto avanza tu hijo/a con reportes simples, sin jerga pedagógica.' },
]
const GAMES_PREVIEW = [
  { emoji: '🔎', title: 'Word Search' },
  { emoji: '🎯', title: 'Basic Quiz' },
  { emoji: '🧩', title: 'Memory Game' },
  { emoji: '✏️', title: 'Sentences' },
  { emoji: '🎧', title: 'Listening' },
  { emoji: '🌟', title: 'Advanced Quiz' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 py-5">
        <h1 className="text-2xl font-extrabold text-purple-700">🪄 Magic English</h1>
        <Link
          href="/login"
          className="text-sm font-semibold text-purple-700 border border-purple-200 rounded-full px-5 py-2 hover:bg-purple-50 transition"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="relative text-center px-6 pt-10 pb-20">
        {/* decorative blobs */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute top-20 -right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-40 -z-10" />

        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
        >
          ✨ Para niños de 5 a 7 años
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold mb-5 leading-tight"
        >
          Aprende inglés
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            jugando y sonriendo
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 max-w-lg mx-auto mb-8 text-lg"
        >
          Tu hijo/a completa retos cortos, gana estrellas y recorre 6 mundos mágicos llenos de vocabulario nuevo cada semana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            href="/login"
            className="inline-block bg-purple-600 text-white rounded-xl px-8 py-4 font-bold text-lg shadow-lg shadow-purple-200 hover:bg-purple-700 hover:scale-105 transition"
          >
            🚀 Comenzar aventura gratis
          </Link>
          <a
            href="#mundos"
            className="inline-block bg-white text-purple-700 border border-purple-200 rounded-xl px-8 py-4 font-bold text-lg hover:bg-purple-50 transition"
          >
            Ver los mundos
          </a>
        </motion.div>

        <p className="text-sm text-gray-400 mt-4">Sin tarjeta de crédito · 2 mundos gratis para siempre</p>
      </section>

      {/* Features */}
      <section className="px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
            >
              <div className="text-4xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* World map preview */}
      <section id="mundos" className="px-6 pb-20">
        <h2 className="text-3xl font-extrabold text-center mb-2">🗺️ Magic World</h2>
        <p className="text-gray-500 text-center mb-10">
          ¡Viaja por diferentes mundos y desbloquea nuevos juegos! 🚀
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {worlds.map((world, i) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.04 }}
              className={`relative rounded-2xl p-6 shadow-md text-center ${world.color} ${!world.free ? 'opacity-80' : ''}`}
            >
              {!world.free && (
                <span className="absolute top-3 right-3 text-lg">🔒</span>
              )}
              <div className="text-5xl mb-2">{world.emoji}</div>
              <p className="font-bold">{world.title}</p>
              <p className="text-xs text-gray-600 mt-1">{world.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <h2 className="text-3xl font-extrabold text-center mb-2">🎮 English Games</h2>
        <p className="text-gray-500 text-center mb-10">Escoge un juego y practica mientras ganas puntos.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
          {GAMES_PREVIEW.map(game => (
            <Link
              key={game.title}
              href="/login?next=/games"
              className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-md hover:scale-105 transition block"
            >
              <div className="text-4xl mb-2">{game.emoji}</div>
              <p className="font-bold text-sm">{game.title}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-pink-500 rounded-3xl p-10 text-center text-white shadow-xl">
          <h2 className="text-3xl font-extrabold mb-3">¿Listo para la aventura?</h2>
          <p className="mb-6 opacity-90">Crea una cuenta gratis en menos de un minuto.</p>
          <Link
            href="/login"
            className="inline-block bg-white text-purple-700 rounded-xl px-8 py-3 font-bold text-lg hover:scale-105 transition"
          >
            Comenzar ahora
          </Link>
        </div>
      </section>

      <footer className="text-center text-gray-400 text-sm py-8">
        Magic English · Aprende, juega y diviértete 🌈
      </footer>
    </div>
  )
}