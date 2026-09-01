'use client'
import { Howl } from 'howler'

export default function ActivityCard({ word, image, audio }: {
  word: string; image: string; audio: string
}) {
  const play = () => new Howl({ src: [audio] }).play()

  return (
    <button
      onClick={play}
      className="rounded-2xl bg-yellow-300 p-6 shadow-lg active:scale-95 transition"
    >
      <img src={image} alt={word} className="w-32 h-32 mx-auto" />
      <p className="text-2xl font-bold mt-2">{word}</p>
    </button>
  )
}