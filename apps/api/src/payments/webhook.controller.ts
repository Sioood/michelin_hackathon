import { Body, Controller, Headers, Post, Req } from '@nestjs/common'

import { PaymentsService } from './payments.service'

import type { StripeWebhookPayload } from './payments.service'
import type { RawBodyRequest } from '@nestjs/common'
import type { Request } from 'express'

@Controller('payments')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleStripeWebhook(
    @Body() payload: StripeWebhookPayload,
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') stripeSignature?: string,
  ): Promise<{ received: true }> {
    await this.paymentsService.handleWebhook(payload, stripeSignature, request.rawBody)

    return { received: true }
  }
}
