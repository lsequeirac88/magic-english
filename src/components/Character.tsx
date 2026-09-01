'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { TargetAndTransition } from 'framer-motion'
import { useEffect, useState } from 'react'

type Mood = 'idle' | 'happy' | 'sad' | 'talking'

export default function Character({ mood = 'idle', message }: {
  mood?: Mood
  message?: string
}) {
  const [showBubble, setShowBubble] = useState(!!message)

  useEffect(() => {
    setShowBubble(!!message)
  }, [message])

  const moodImages: Record<Mood, string> = {
    idle: '/images/mascot-idle.png',
    happy: '/images/mascot-happy.png',
    sad: '/images/mascot-sad.png',
    talking: '/images/mascot-talking.png',
  }

  const bounceAnimation: Record<Mood, TargetAndTransition> = {
    idle: { y: [0, -8, 0], transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' } },
    happy: { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0], transition: { duration: 0.6 } },
    sad: { rotate: [0, -3, 3, 0], transition: { duration: 0.4 } },
    talking: { scale: [1, 1.05, 1], transition: { duration: 0.3, repeat: Infinity } },
  }

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence>
        {showBubble && message && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-white rounded-2xl px-4 py-2 shadow-md mb-2 relative max-w-xs text-center"
          >
            <p className="text-sm font-medium">{message}</p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        src={moodImages[mood]}
        alt="mascota"
        animate={bounceAnimation[mood]}
        className="w-28 h-28 object-contain"
      />
    </div>
  )
}