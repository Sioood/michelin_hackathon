import { Injectable, UnauthorizedException } from '@nestjs/common'
import Stripe from 'stripe'

import { LoyaltyService } from '../loyalty/loyalty.service'
import { OrdersService } from '../orders/orders.service'

import type { PublicUserDto } from '../users/users.service'

export interface CheckoutSessionDto {
  orderId: number
  sessionId: string
  url: string
}

export interface StripeWebhookPayload {
  data?: {
    object?: {
      id?: string
    }
  }
  type?: string
}

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe | null

  constructor(
    private readonly loyaltyService: LoyaltyService,
    private readonly ordersService: OrdersService,
  ) {
    this.stripe =
      process.env.STRIPE_SECRET_KEY === undefined ? null : new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async createCheckoutSession(user: PublicUserDto): Promise<CheckoutSessionDto> {
    const order = await this.ordersService.createPendingFromActiveCart(user.id as number)
    const orderId = order.id as number

    if (this.stripe === null) {
      const sessionId = `demo_${orderId}_${Date.now()}`
      await this.ordersService.attachStripeSession(orderId, sessionId)

      return {
        orderId,
        sessionId,
        url: `${process.env.CHECKOUT_SUCCESS_URL ?? 'http://localhost:3000/checkout/success'}?orderId=${orderId}`,
      }
    }

    const session = await this.stripe.checkout.sessions.create({
      cancel_url: process.env.CHECKOUT_CANCEL_URL ?? 'http://localhost:3000/checkout',
      ...(await this.buildStripeDiscounts(user.id as number)),
      line_items:
        order.items?.map((item) => ({
          price_data: {
            currency: order.currency.toLowerCase(),
            product_data: {
              name: item.productName,
            },
            unit_amount: item.unitPriceCents,
          },
          quantity: item.quantity,
        })) ?? [],
      metadata: {
        orderId: String(orderId),
        userId: String(user.id),
      },
      mode: 'payment',
      success_url:
        process.env.CHECKOUT_SUCCESS_URL ??
        'http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
    })

    await this.ordersService.attachStripeSession(orderId, session.id)

    return {
      orderId,
      sessionId: session.id,
      url:
        session.url ?? process.env.CHECKOUT_SUCCESS_URL ?? 'http://localhost:3000/checkout/success',
    }
  }

  async handleCheckoutCompleted(sessionId: string): Promise<void> {
    const order = await this.ordersService.markPaidByStripeSession(sessionId)
    await this.loyaltyService.onOrderPaid(order)
  }

  private async buildStripeDiscounts(
    userId: number,
  ): Promise<Pick<Stripe.Checkout.SessionCreateParams, 'discounts'>> {
    const couponId = await this.loyaltyService.getCheckoutDiscountCouponId(userId)

    if (couponId === null || couponId.startsWith('demo_')) {
      return {}
    }

    return {
      discounts: [{ coupon: couponId }],
    }
  }

  async handleWebhook(
    payload: StripeWebhookPayload,
    stripeSignature: string | undefined,
    rawBody: Buffer | undefined,
  ): Promise<void> {
    if (process.env.STRIPE_WEBHOOK_SECRET !== undefined) {
      if (this.stripe === null || rawBody === undefined || stripeSignature === undefined) {
        throw new UnauthorizedException('Invalid Stripe webhook configuration')
      }

      const event = this.stripe.webhooks.constructEvent(
        rawBody,
        stripeSignature,
        process.env.STRIPE_WEBHOOK_SECRET,
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        await this.handleCheckoutCompleted(session.id)
      }

      return
    }

    if (payload.type === 'checkout.session.completed' && payload.data?.object?.id !== undefined) {
      await this.handleCheckoutCompleted(payload.data.object.id)
    }
  }
}
