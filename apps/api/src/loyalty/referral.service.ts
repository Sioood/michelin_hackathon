import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { OrdersService } from '../orders/orders.service'

import { LoyaltyTransaction } from './loyalty-transaction.model'
import { WelcomeService } from './welcome.service'

import type { Order } from '../orders/order.model'

const REFERRAL_REFERRER_BONUS_POINTS = 200

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(LoyaltyTransaction)
    private readonly loyaltyTransactionModel: typeof LoyaltyTransaction,
    private readonly ordersService: OrdersService,
    private readonly welcomeService: WelcomeService,
  ) {}

  async resolveReferrerUserId(referralCode: string | undefined): Promise<number | null> {
    if (referralCode === undefined || referralCode.trim().length === 0) {
      return null
    }

    const account = await this.welcomeService.findAccountByReferralCode(referralCode.trim())

    return account?.userId ?? null
  }

  async awardReferrerOnFirstOrder(order: Order): Promise<void> {
    const paidOrderCount = await this.ordersService.countPaidOrdersForUser(order.userId)

    if (paidOrderCount !== 1) {
      return
    }

    const account = await this.welcomeService.findAccountByUserId(order.userId)

    if (account === null || account.referredByUserId === null) {
      return
    }

    const referrerAccount = await this.welcomeService.findAccountByUserId(account.referredByUserId)

    if (referrerAccount === null || referrerAccount.id === undefined || order.id === undefined) {
      return
    }

    const existingReferralBonus = await this.loyaltyTransactionModel.findOne({
      where: {
        loyaltyAccountId: referrerAccount.id,
        orderId: order.id,
        type: 'referral_bonus',
      },
    })

    if (existingReferralBonus !== null) {
      return
    }

    await referrerAccount.update({
      balance: referrerAccount.balance + REFERRAL_REFERRER_BONUS_POINTS,
    })
    await this.loyaltyTransactionModel.create({
      amount: REFERRAL_REFERRER_BONUS_POINTS,
      description: `Parrainage — première commande filleul #${order.id}`,
      loyaltyAccountId: referrerAccount.id,
      orderId: order.id,
      type: 'referral_bonus',
    })
  }
}
