import { Module } from '@nestjs/common'

import { LoyaltyModule } from '../loyalty/loyalty.module'
import { OrdersModule } from '../orders/orders.module'

import { CheckoutController } from './checkout.controller'
import { PaymentsService } from './payments.service'
import { WebhookController } from './webhook.controller'

@Module({
  controllers: [CheckoutController, WebhookController],
  imports: [LoyaltyModule, OrdersModule],
  providers: [PaymentsService],
})
export class PaymentsModule {}
