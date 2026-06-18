import { randomBytes } from 'node:crypto'

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import Stripe from 'stripe'

import { LoyaltyAccount } from './loyalty-account.model'
import { LoyaltyTransaction } from './loyalty-transaction.model'

import type { LoyaltyTransactionType } from './loyalty-transaction.model'

const SIGNUP_BONUS_POINTS = 100
const REFERRAL_INVITEE_BONUS_POINTS = 50

@Injectable()
export class WelcomeService {
  private readonly stripe: Stripe | null

  constructor(
    @InjectModel(LoyaltyAccount)
    private readonly loyaltyAccountModel: typeof LoyaltyAccount,
    @InjectModel(LoyaltyTransaction)
    private readonly loyaltyTransactionModel: typeof LoyaltyTransaction,
  ) {
    this.stripe =
      process.env.STRIPE_SECRET_KEY === undefined ? null : new Stripe(process.env.STRIPE_SECRET_KEY)
  }

  async createAccountForUser(
    userId: number,
    referredByUserId: number | null,
  ): Promise<LoyaltyAccount> {
    const referralCode = await this.generateUniqueReferralCode(userId)
    const stripeWelcomeCouponId = await this.createWelcomeStripeCoupon(userId)

    const account = await this.loyaltyAccountModel.create({
      balance: 0,
      referralCode,
      referredByUserId,
      stripeWelcomeCouponId,
      userId,
    })

    await this.creditPoints({
      account,
      amount: SIGNUP_BONUS_POINTS,
      description: 'Bonus de bienvenue à l’inscription',
      type: 'signup_bonus',
    })

    if (referredByUserId !== null) {
      await this.creditPoints({
        account,
        amount: REFERRAL_INVITEE_BONUS_POINTS,
        description: 'Bonus parrainage — bienvenue filleul',
        type: 'referral_invitee',
      })
    }

    return this.reloadAccount(account.id as number)
  }

  async isWelcomeDiscountAvailable(userId: number): Promise<boolean> {
    const account = await this.findAccountByUserId(userId)

    if (account === null) {
      return false
    }

    return !account.welcomeDiscountUsed && account.stripeWelcomeCouponId !== null
  }

  async getWelcomeCouponId(userId: number): Promise<string | null> {
    const account = await this.findAccountByUserId(userId)

    if (account === null || account.welcomeDiscountUsed) {
      return null
    }

    return account.stripeWelcomeCouponId
  }

  async markWelcomeDiscountUsed(userId: number): Promise<void> {
    const account = await this.findAccountByUserId(userId)

    if (account === null) {
      return
    }

    await account.update({ welcomeDiscountUsed: true })
  }

  async findAccountByUserId(userId: number): Promise<LoyaltyAccount | null> {
    return this.loyaltyAccountModel.findOne({ where: { userId } })
  }

  async findAccountByReferralCode(code: string): Promise<LoyaltyAccount | null> {
    return this.loyaltyAccountModel.findOne({
      where: { referralCode: code.toUpperCase() },
    })
  }

  private async creditPoints(input: {
    account: LoyaltyAccount
    amount: number
    description: string
    orderId?: number
    type: LoyaltyTransactionType
  }): Promise<void> {
    if (input.account.id === undefined) {
      throw new BadRequestException('Invalid loyalty account')
    }

    await input.account.update({ balance: input.account.balance + input.amount })
    await this.loyaltyTransactionModel.create({
      amount: input.amount,
      description: input.description,
      loyaltyAccountId: input.account.id,
      orderId: input.orderId ?? null,
      type: input.type,
    })
  }

  private async reloadAccount(accountId: number): Promise<LoyaltyAccount> {
    const account = await this.loyaltyAccountModel.findByPk(accountId)

    if (account === null) {
      throw new NotFoundException('Loyalty account not found')
    }

    return account
  }

  private async generateUniqueReferralCode(userId: number): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const suffix = randomBytes(3).toString('hex').toUpperCase()
      const candidate = `RIDE${userId}${suffix}`
      const existing = await this.loyaltyAccountModel.findOne({
        where: { referralCode: candidate },
      })

      if (existing === null) {
        return candidate
      }
    }

    return `RIDE${userId}${Date.now().toString(36).toUpperCase()}`
  }

  private async createWelcomeStripeCoupon(userId: number): Promise<string | null> {
    if (this.stripe === null) {
      return `demo_welcome_${userId}`
    }

    const coupon = await this.stripe.coupons.create({
      duration: 'once',
      id: `welcome_${userId}_${Date.now()}`,
      max_redemptions: 1,
      name: 'Bienvenue -20% première commande',
      percent_off: 20,
    })

    return coupon.id
  }
}
