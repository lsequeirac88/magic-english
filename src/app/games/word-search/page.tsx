'use client'
import { useState, useMemo, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getAllWords } from '@/lib/vocabulary'

const GRID_SIZE = 10
const WORD_COUNT = 6

type Cell = { row: number; col: number }
type Placement = { word: string; cells: Cell[] }

function buildPuzzle() {
  const candidates = getAllWords()
    .map(w => w.word.toUpperCase())
    .filter(w => w.length <= GRID_SIZE)
  const shuffled = [...new Set(candidates)].sort(() => 0.5 - Math.random())

  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  )
  const placements: Placement[] = []

  for (const word of shuffled) {
    if (placements.length >= WORD_COUNT) break
    let placed = false

    for (let attempt = 0; attempt < 40 && !placed; attempt++) {
      const horizontal = Math.random() < 0.5
      const maxRow = horizontal ? GRID_SIZE : GRID_SIZE - word.length
      const maxCol = horizontal ? GRID_SIZE - word.length : GRID_SIZE
      if (maxRow <= 0 || maxCol <= 0) continue

      const row = Math.floor(Math.random() * maxRow)
      const col = Math.floor(Math.random() * maxCol)

      const cells: Cell[] = Array.from({ length: word.length }, (_, i) => ({
        row: horizontal ? row : row + i,
        col: horizontal ? col + i : col,
      }))

      const fits = cells.every(c => {
        const current = grid[c.row][c.col]
        const letterIndex = horizontal ? c.col - col : c.row - row
        return current === null || current === word[letterIndex]
      })

      if (fits) {
        cells.forEach((c, i) => { grid[c.row][c.col] = word[i] })
        placements.push({ word, cells })
        placed = true
      }
    }
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === null) grid[r][c] = letters[Math.floor(Math.random() * letters.length)]
    }
  }

  return { grid: grid as string[][], placements }
}

function cellsEqual(a: Cell[], b: Cell[]) {
  if (a.length !== b.length) return false
  return a.every((cell, i) => cell.row === b[i].row && cell.col === b[i].col)
}

function pathBetween(start: Cell, end: Cell): Cell[] | null {
  if (start.row === end.row) {
    const [from, to] = start.col <= end.col ? [start.col, end.col] : [end.col, start.col]
    const path = Array.from({ length: to - from + 1 }, (_, i) => ({ row: start.row, col: from + i }))
    return start.col <= end.col ? path : path.reverse()
  }
  if (start.col === end.col) {
    const [from, to] = start.row <= end.row ? [start.row, end.row] : [end.row, start.row]
    const path = Array.from({ length: to - from + 1 }, (_, i) => ({ row: from + i, col: start.col }))
    return start.row <= end.row ? path : path.reverse()
  }
  return null
}

export default function WordSearchPage() {
  const searchParams = useSearchParams()
  const childId = searchParams.get('child')
  const router = useRouter()

  const puzzle = useMemo(() => buildPuzzle(), [])
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [selectionStart, setSelectionStart] = useState<Cell | null>(null)
  const [wrongFlash, setWrongFlash] = useState<Cell[]>([])
  const saved = useRef(false)

  const finished = foundWords.size === puzzle.placements.length && puzzle.placements.length > 0

  const closeGame = () => router.push(`/games?child=${childId}`)

  if (finished && !saved.current) {
    saved.current = true
    fetch('/api/game-progress', {
      method: 'POST',
      body: JSON.stringify({ childId, gameId: 'word-search', score: foundWords.size, total: puzzle.placements.length }),
    })
  }

  const foundCells = new Set(
    puzzle.placements
      .filter(p => foundWords.has(p.word))
      .flatMap(p => p.cells.map(c => `${c.row}-${c.col}`))
  )

  const handleCellClick = (cell: Cell) => {
    if (!selectionStart) {
      setSelectionStart(cell)
      return
    }
    if (selectionStart.row === cell.row && selectionStart.col === cell.col) {
      setSelectionStart(null)
      return
    }

    const path = pathBetween(selectionStart, cell)
    if (!path) {
      setSelectionStart(cell)
      return
    }

    const match = puzzle.placements.find(p =>
      !foundWords.has(p.word) &&
      (cellsEqual(p.cells, path) || cellsEqual(p.cells, [...path].reverse()))
    )

    if (match) {
      setFoundWords(prev => new Set(prev).add(match.word))
    } else {
      setWrongFlash(path)
      setTimeout(() => setWrongFlash([]), 400)
    }
    setSelectionStart(null)
  }

  const restart = () => window.location.reload()

  if (finished) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 flex flex-col items-center justify-center p-6 text-center gap-4">
        <div className="text-6xl">🔎🎉</div>
        <h1 className="text-3xl font-extrabold">¡Encontraste todas las palabras!</h1>
        <p className="text-xl">{foundWords.size} / {puzzle.placements.length}</p>
        <div className="flex gap-3 mt-4 flex-wrap justify-center">
          <button onClick={restart} className="bg-purple-600 text-white rounded-xl px-6 py-3 font-bold">Jugar de nuevo</button>
          <button onClick={closeGame} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-bold">Volver a juegos</button>
          <button onClick={() => router.push('/dashboard')} className="bg-white border border-gray-200 rounded-xl px-6 py-3 font-bold">🏠 Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-purple-50 p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="text-gray-400 hover:text-gray-700 text-lg" title="Volver al panel de padres">🏠</button>
            <button onClick={closeGame} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
          </div>
          <h1 className="font-bold text-lg">🔎 Word Search</h1>
          <span className="text-sm font-semibold text-gray-500">{foundWords.size}/{puzzle.placements.length}</span>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {puzzle.placements.map(p => (
            <span
              key={p.word}
              className={`text-xs font-bold px-2 py-1 rounded-full ${foundWords.has(p.word) ? 'bg-green-100 text-green-600 line-through' : 'bg-white border border-gray-200 text-gray-500'}`}
            >
              {p.word}
            </span>
          ))}
        </div>

        <div
          className="grid gap-1 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {puzzle.grid.map((row, r) =>
            row.map((letter, c) => {
              const key = `${r}-${c}`
              const isFound = foundCells.has(key)
              const isSelected = selectionStart?.row === r && selectionStart?.col === c
              const isWrong = wrongFlash.some(cell => cell.row === r && cell.col === c)

              let style = 'bg-gray-50 text-gray-700'
              if (isFound) style = 'bg-green-200 text-green-800'
              else if (isWrong) style = 'bg-red-200 text-red-700'
              else if (isSelected) style = 'bg-purple-500 text-white'

              return (
                <button
                  key={key}
                  onClick={() => handleCellClick({ row: r, col: c })}
                  className={`aspect-square rounded-md text-xs sm:text-sm font-bold transition ${style}`}
                >
                  {letter}
                </button>
              )
            })
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Toca la primera letra de una palabra y luego la última (en línea recta).
        </p>
      </div>
    </div>
  )
}