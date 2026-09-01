import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { childId, gameId, score, total } = await req.json()
  const entry = await prisma.gameProgress.create({
    data: { childId, gameId, score, total },
  })
  return NextResponse.json(entry)
}

export async function GET(req: Request) {
  const childId = new URL(req.url).searchParams.get('childId')!
  const entries = await prisma.gameProgress.findMany({ where: { childId } })
  return NextResponse.json(entries)
}