import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const parentId = new URL(req.url).searchParams.get('parentId')!
  const children = await prisma.child.findMany({ where: { parentId } })
  return NextResponse.json(children)
}

export async function POST(req: Request) {
  const { name, parentId, avatar } = await req.json()
  const child = await prisma.child.create({ data: { name, parentId, avatar } })
  return NextResponse.json(child)
}