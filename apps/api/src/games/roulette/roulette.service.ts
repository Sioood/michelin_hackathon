import { randomUUID } from 'node:crypto'

import { BadRequestException, Injectable } from '@nestjs/common'

import { LoyaltyService } from '../../loyalty/loyalty.service'

import type { PendingDiscount } from '../../loyalty/loyalty-account.model'

export type RoulettePrizeType = 'discount_percent' | 'points'

export interface RoulettePrize {
  amount: number
  label: string
  type: RoulettePrizeType
  weight: number
}

export interface RouletteSpinResultDto {
  balance: number
  canSpinAgainAt: string
  label: string
  prize: RoulettePrize
}

const ROULETTE_PRIZES: RoulettePrize[] = [
  { amount: 10, label: '10 points', type: 'points', weight: 30 },
  { amount: 25, label: '25 points', type: 'points', weight: 25 },
  { amount: 50, label: '50 points', type: 'points', weight: 20 },
  { amount: 100, label: '100 points', type: 'points', weight: 10 },
  { amount: 5, label: '5% de réduction', type: 'discount_percent', weight: 10 },
  { amount: 10, label: '10% de réduction', type: 'discount_percent', weight: 5 },
]

@Injectable()
export class RouletteService {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  async spin(userId: number): Promise<RouletteSpinResultDto> {
    const overview = await this.loyaltyService.getOverview(userId)

    if (!overview.canSpinRoulette) {
      throw new BadRequestException('Vous avez déjà tourné la roue aujourd’hui')
    }

    const prize = this.pickPrize()
    let pendingDiscount: PendingDiscount | undefined

    if (prize.type === 'discount_percent') {
      pendingDiscount = {
        createdAt: new Date().toISOString(),
        id: randomUUID(),
        source: 'roulette',
        type: 'percent',
        used: false,
        value: prize.amount,
      }
    }

    const account = await this.loyaltyService.creditRouletteReward(userId, {
      amount: prize.type === 'points' ? prize.amount : 0,
      description: `Roulette — ${prize.label}`,
      pendingDiscount,
    })

    const tomorrow = new Date()
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)

    return {
      balance: account.balance,
      canSpinAgainAt: tomorrow.toISOString(),
      label: prize.label,
      prize,
    }
  }

  private pickPrize(): RoulettePrize {
    const totalWeight = ROULETTE_PRIZES.reduce((sum, prize) => sum + prize.weight, 0)
    let roll = Math.random() * totalWeight

    for (const prize of ROULETTE_PRIZES) {
      roll -= prize.weight

      if (roll <= 0) {
        return prize
      }
    }

    return ROULETTE_PRIZES[0] as RoulettePrize
  }
}
