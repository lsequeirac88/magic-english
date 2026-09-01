import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { childId, worldId, activityId, stars } = await req.json()
  const progress = await prisma.progress.create({
    data: { childId, worldId, activityId, stars },
  })
  return NextResponse.json(progress)
}

export async function GET(req: Request) {
  const childId = new URL(req.url).searchParams.get('childId')!
  const progress = await prisma.progress.findMany({ where: { childId } })
  return NextResponse.json(progress)
}