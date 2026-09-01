import vocabulary from '@/data/vocabulary.json'

export type Word = {
  word: string
  translation: string
  emoji: string
  image: string
  audio: string
}

export function getWorldWords(worldId: string): Word[] {
  return vocabulary[worldId as keyof typeof vocabulary]?.words || []
}

export function getWorldTitle(worldId: string): string {
  return vocabulary[worldId as keyof typeof vocabulary]?.title || ''
}

export function getActivityOptions(words: Word[], targetIndex: number, count = 3): Word[] {
  const target = words[targetIndex]
  const others = words.filter((_, i) => i !== targetIndex)
  const shuffled = others.sort(() => 0.5 - Math.random()).slice(0, count - 1)
  return [target, ...shuffled].sort(() => 0.5 - Math.random())
}

export function getAllWords(): Word[] {
  return Object.values(vocabulary).flatMap(w => w.words)
}

export function generateQuiz(count = 10) {
  const all = getAllWords()
  const shuffled = [...all].sort(() => 0.5 - Math.random())
  const picked = shuffled.slice(0, Math.min(count, all.length))

  return picked.map(correct => {
    const distractors = all
      .filter(w => w.word !== correct.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    const options = [correct, ...distractors].sort(() => 0.5 - Math.random())
    return { question: correct, options }
  })
}

const SENTENCE_TEMPLATES = [
  'I have a ___.',
  'I can see a ___.',
  'Look at the ___!',
  'This is my ___.',
  'I like the ___.',
]

export function generateSentenceQuiz(count = 8) {
  const all = getAllWords()
  const shuffled = [...all].sort(() => 0.5 - Math.random())
  const picked = shuffled.slice(0, Math.min(count, all.length))

  return picked.map(correct => {
    const template = SENTENCE_TEMPLATES[Math.floor(Math.random() * SENTENCE_TEMPLATES.length)]
    const distractors = all
      .filter(w => w.word !== correct.word)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
    const options = [correct, ...distractors].sort(() => 0.5 - Math.random())
    return { sentence: template, answer: correct, options }
  })
}