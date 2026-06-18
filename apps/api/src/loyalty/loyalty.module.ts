import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Order } from '../orders/order.model'

import { LoyaltyAccount } from './loyalty-account.model'
import { LoyaltyTransaction } from './loyalty-transaction.model'
import { LoyaltyController } from './loyalty.controller'
import { LoyaltyService } from './loyalty.service'
import { PromoCode } from './promo-code.model'
import { PromoRedemption } from './promo-redemption.model'
import { ReferralService } from './referral.service'
import { WelcomeService } from './welcome.service'

@Module({
  controllers: [LoyaltyController],
  exports: [LoyaltyService, WelcomeService, ReferralService],
  imports: [
    SequelizeModule.forFeature([
      LoyaltyAccount,
      LoyaltyTransaction,
      Order,
      PromoCode,
      PromoRedemption,
    ]),
  ],
  providers: [LoyaltyService, WelcomeService, ReferralService],
})
export class LoyaltyModule {}
