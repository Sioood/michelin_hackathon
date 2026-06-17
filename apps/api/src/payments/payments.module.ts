import { Module } from '@nestjs/common'

import { OrdersModule } from '../orders/orders.module'

import { CheckoutController } from './checkout.controller'
import { PaymentsService } from './payments.service'
import { WebhookController } from './webhook.controller'

@Module({
  controllers: [CheckoutController, WebhookController],
  imports: [OrdersModule],
  providers: [PaymentsService],
})
export class PaymentsModule {}
