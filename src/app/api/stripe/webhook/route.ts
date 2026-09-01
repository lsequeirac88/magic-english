import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature inválida' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const parentId = session.metadata?.parentId
      if (parentId) {
        await prisma.parent.update({
          where: { id: parentId },
          data: {
            isSubscribed: true,
            subscriptionId: session.subscription as string,
          },
        })
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const isActive = subscription.status === 'active'
      const parent = await prisma.parent.findFirst({
        where: { stripeCustomerId: subscription.customer as string },
      })
      if (parent) {
        await prisma.parent.update({
          where: { id: parent.id },
          data: { isSubscribed: isActive },
        })
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}