import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { id, email } = await req.json()

  const parent = await prisma.parent.upsert({
    where: { id },
    update: { email },
    create: { id, email },
  })

  return NextResponse.json(parent)
}