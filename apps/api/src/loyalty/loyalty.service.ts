import { randomUUID } from 'node:crypto'

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Order } from '../orders/order.model'

import { LoyaltyAccount } from './loyalty-account.model'
import { LoyaltyTransaction } from './loyalty-transaction.model'
import { PromoCode } from './promo-code.model'
import { PromoRedemption } from './promo-redemption.model'
import { ReferralService } from './referral.service'
import { LOYALTY_REWARDS, PROMO_CODE_SEEDS } from './rewards.seed'
import { WelcomeService } from './welcome.service'

import type { PendingDiscount } from './loyalty-account.model'
import type { LoyaltyReward } from './rewards.seed'

export interface LoyaltyOverviewDto {
  balance: number
  canSpinRoulette: boolean
  lastRouletteSpinAt: string | null
  pendingDiscounts: PendingDiscount[]
  referralCode: string
  rewards: LoyaltyReward[]
  transactions: LoyaltyTransaction[]
  welcomeDiscountAvailable: boolean
}

export interface RedeemCodeResultDto {
  balance: number
  message: string
  pointsAwarded: number
}

export interface RedeemRewardResultDto {
  balance: number
  message: string
  pendingDiscount: PendingDiscount
  pointsSpent: number
}

@Injectable()
export class LoyaltyService implements OnModuleInit {
  @InjectModel(LoyaltyAccount)
  private readonly loyaltyAccountModel!: typeof LoyaltyAccount

  @InjectModel(LoyaltyTransaction)
  private readonly loyaltyTransactionModel!: typeof LoyaltyTransaction

  @InjectModel(PromoCode)
  private readonly promoCodeModel!: typeof PromoCode

  @InjectModel(PromoRedemption)
  private readonly promoRedemptionModel!: typeof PromoRedemption

  constructor(
    private readonly referralService: ReferralService,
    private readonly welcomeService: WelcomeService,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const seed of PROMO_CODE_SEEDS) {
      const existing = await this.promoCodeModel.findOne({ where: { code: seed.code } })

      if (existing === null) {
        await this.promoCodeModel.create({
          code: seed.code,
          description: seed.description,
          isActive: true,
          maxRedemptions: seed.maxRedemptions ?? null,
          pointsReward: seed.pointsReward,
          type: seed.type,
        })
      }
    }
  }

  async bootstrapForRegistration(
    userId: number,
    referralCode: string | undefined,
  ): Promise<LoyaltyAccount> {
    const referredByUserId = await this.referralService.resolveReferrerUserId(referralCode)

    if (referredByUserId !== null && referredByUserId === userId) {
      throw new BadRequestException('Vous ne pouvez pas utiliser votre propre code parrain')
    }

    return this.welcomeService.createAccountForUser(userId, referredByUserId)
  }

  async getOverview(userId: number): Promise<LoyaltyOverviewDto> {
    const account = await this.requireAccountByUserId(userId)
    const transactions = await this.loyaltyTransactionModel.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']],
      where: { loyaltyAccountId: account.id },
    })

    return {
      balance: account.balance,
      canSpinRoulette: this.canSpinRoulette(account),
      lastRouletteSpinAt: account.lastRouletteSpinAt?.toISOString() ?? null,
      pendingDiscounts: account.pendingDiscounts.filter((discount) => !discount.used),
      referralCode: account.referralCode,
      rewards: LOYALTY_REWARDS,
      transactions,
      welcomeDiscountAvailable:
        !account.welcomeDiscountUsed && account.stripeWelcomeCouponId !== null,
    }
  }

  async redeemCode(userId: number, code: string): Promise<RedeemCodeResultDto> {
    const account = await this.requireAccountByUserId(userId)
    const normalizedCode = code.trim().toUpperCase()
    const promoCode = await this.promoCodeModel.findOne({ where: { code: normalizedCode } })

    if (promoCode === null || !promoCode.isActive) {
      throw new NotFoundException('Code promo invalide')
    }

    if (
      promoCode.maxRedemptions !== null &&
      promoCode.currentRedemptions >= promoCode.maxRedemptions
    ) {
      throw new BadRequestException('Ce code promo n’est plus disponible')
    }

    if (promoCode.id === undefined || account.id === undefined) {
      throw new BadRequestException('Invalid promo code')
    }

    const existingRedemption = await this.promoRedemptionModel.findOne({
      where: { promoCodeId: promoCode.id, userId },
    })

    if (existingRedemption !== null) {
      throw new ConflictException('Vous avez déjà utilisé ce code')
    }

    await this.promoRedemptionModel.create({
      promoCodeId: promoCode.id,
      userId,
    })
    await promoCode.update({ currentRedemptions: promoCode.currentRedemptions + 1 })
    await account.update({ balance: account.balance + promoCode.pointsReward })
    await this.loyaltyTransactionModel.create({
      amount: promoCode.pointsReward,
      description: promoCode.description,
      loyaltyAccountId: account.id,
      orderId: null,
      type: 'promo_redeem',
    })

    return {
      balance: account.balance + promoCode.pointsReward,
      message: `${promoCode.pointsReward} points ajoutés à votre compte`,
      pointsAwarded: promoCode.pointsReward,
    }
  }

  async redeemReward(userId: number, rewardId: string): Promise<RedeemRewardResultDto> {
    const account = await this.requireAccountByUserId(userId)
    const reward = LOYALTY_REWARDS.find((item) => item.id === rewardId)

    if (reward === undefined) {
      throw new NotFoundException('Récompense introuvable')
    }

    if (account.balance < reward.pointsCost) {
      throw new BadRequestException('Solde de points insuffisant')
    }

    if (account.id === undefined) {
      throw new BadRequestException('Invalid loyalty account')
    }

    const pendingDiscount = this.createPendingDiscountFromReward(reward)
    const updatedDiscounts = [...account.pendingDiscounts, pendingDiscount]

    await account.update({
      balance: account.balance - reward.pointsCost,
      pendingDiscounts: updatedDiscounts,
    })
    await this.loyaltyTransactionModel.create({
      amount: -reward.pointsCost,
      description: `Échange — ${reward.name}`,
      loyaltyAccountId: account.id,
      orderId: null,
      type: 'reward_redeem',
    })

    return {
      balance: account.balance - reward.pointsCost,
      message: `Récompense « ${reward.name} » activée`,
      pendingDiscount,
      pointsSpent: reward.pointsCost,
    }
  }

  async onOrderPaid(order: Order): Promise<void> {
    const account = await this.welcomeService.findAccountByUserId(order.userId)

    if (account === null || account.id === undefined) {
      return
    }

    const pointsEarned = Math.floor(order.totalCents / 100)

    if (pointsEarned > 0) {
      await account.update({ balance: account.balance + pointsEarned })
      await this.loyaltyTransactionModel.create({
        amount: pointsEarned,
        description: `Points commande #${order.id}`,
        loyaltyAccountId: account.id,
        orderId: order.id ?? null,
        type: 'purchase',
      })
    }

    await this.referralService.awardReferrerOnFirstOrder(order)
    await this.welcomeService.markWelcomeDiscountUsed(order.userId)
    await this.markPendingDiscountsUsed(account)
  }

  async getCheckoutDiscountCouponId(userId: number): Promise<string | null> {
    const welcomeCouponId = await this.welcomeService.getWelcomeCouponId(userId)

    if (welcomeCouponId !== null) {
      return welcomeCouponId
    }

    const account = await this.welcomeService.findAccountByUserId(userId)

    if (account === null) {
      return null
    }

    const pendingPercent = account.pendingDiscounts.find(
      (discount) => !discount.used && discount.type === 'percent',
    )

    if (pendingPercent === undefined) {
      return null
    }

    return `demo_pending_${pendingPercent.id}`
  }

  async creditRouletteReward(
    userId: number,
    input: { amount: number; description: string; pendingDiscount?: PendingDiscount },
  ): Promise<LoyaltyAccount> {
    const account = await this.requireAccountByUserId(userId)

    if (account.id === undefined) {
      throw new BadRequestException('Invalid loyalty account')
    }

    const updates: Partial<LoyaltyAccount> = {
      lastRouletteSpinAt: new Date(),
    }

    if (input.amount > 0) {
      updates.balance = account.balance + input.amount
    }

    if (input.pendingDiscount !== undefined) {
      updates.pendingDiscounts = [...account.pendingDiscounts, input.pendingDiscount]
    }

    await account.update(updates)

    if (input.amount > 0) {
      await this.loyaltyTransactionModel.create({
        amount: input.amount,
        description: input.description,
        loyaltyAccountId: account.id,
        orderId: null,
        type: 'roulette',
      })
    }

    return account.reload()
  }

  canSpinRoulette(account: LoyaltyAccount): boolean {
    if (account.lastRouletteSpinAt === null) {
      return true
    }

    const lastSpinDate = account.lastRouletteSpinAt.toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)

    return lastSpinDate < today
  }

  private async requireAccountByUserId(userId: number): Promise<LoyaltyAccount> {
    const account = await this.welcomeService.findAccountByUserId(userId)

    if (account === null) {
      throw new NotFoundException('Compte fidélité introuvable')
    }

    return account
  }

  private createPendingDiscountFromReward(
    reward: (typeof LOYALTY_REWARDS)[number],
  ): PendingDiscount {
    if (reward.type === 'discount_percent') {
      return {
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        source: 'reward',
        type: 'percent',
        used: false,
        value: reward.value,
      }
    }

    if (reward.type === 'free_shipping') {
      return {
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        source: 'reward',
        type: 'free_shipping',
        used: false,
        value: 0,
      }
    }

    return {
      createdAt: new Date().toISOString(),
      id: randomUUID(),
      source: 'reward',
      type: 'fixed_cents',
      used: false,
      value: reward.value,
    }
  }

  private async markPendingDiscountsUsed(account: LoyaltyAccount): Promise<void> {
    const hasUnused = account.pendingDiscounts.some((discount) => !discount.used)

    if (!hasUnused) {
      return
    }

    await account.update({
      pendingDiscounts: account.pendingDiscounts.map((discount) =>
        discount.used ? discount : { ...discount, used: true },
      ),
    })
  }
}
