import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.progress.deleteMany({ where: { childId: id } })
  await prisma.child.delete({ where: { id } })
  return NextResponse.json({ deleted: true })
}