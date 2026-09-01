import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { parentId, email } = await req.json()

  const parent = await prisma.parent.findUnique({ where: { id: parentId } })
  if (!parent) return NextResponse.json({ error: 'No existe el padre' }, { status: 404 })

  let customerId = parent.stripeCustomerId
  if (!customerId) {
    const customer = await stripe.customers.create({ email })
    customerId = customer.id
    await prisma.parent.update({
      where: { id: parentId },
      data: { stripeCustomerId: customerId },
    })
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade`,
    metadata: { parentId },
  })

  return NextResponse.json({ url: session.url })
}