import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const parentId = new URL(req.url).searchParams.get('parentId')!
  const parent = await prisma.parent.findUnique({ where: { id: parentId } })
  return NextResponse.json({ isSubscribed: parent?.isSubscribed || false })
}