export type LoyaltyRewardType = 'discount_fixed' | 'discount_percent' | 'free_shipping'

export interface LoyaltyReward {
  description: string
  id: string
  name: string
  pointsCost: number
  type: LoyaltyRewardType
  value: number
}

export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    description: 'Bon de 5€ valable sur votre prochaine commande',
    id: 'discount-5eur',
    name: '5€ de réduction',
    pointsCost: 250,
    type: 'discount_fixed',
    value: 500,
  },
  {
    description: 'Bon de 10€ valable sur votre prochaine commande',
    id: 'discount-10eur',
    name: '10€ de réduction',
    pointsCost: 500,
    type: 'discount_fixed',
    value: 1000,
  },
  {
    description: '10% de réduction sur votre prochaine commande',
    id: 'discount-10pct',
    name: '10% de réduction',
    pointsCost: 400,
    type: 'discount_percent',
    value: 10,
  },
  {
    description: 'Livraison offerte sur votre prochaine commande',
    id: 'free-shipping',
    name: 'Livraison offerte',
    pointsCost: 300,
    type: 'free_shipping',
    value: 0,
  },
]

export const PROMO_CODE_SEEDS = [
  {
    code: 'MICHQR100',
    description: 'QR code emballage Michelin — 100 points fidélité',
    pointsReward: 100,
    type: 'qr' as const,
  },
  {
    code: 'MICHPACK50',
    description: 'Code packaging pneu — 50 points fidélité',
    pointsReward: 50,
    type: 'packaging' as const,
  },
  {
    code: 'MICHBIKE200',
    description: 'Bonus vélo premium — 200 points fidélité',
    maxRedemptions: 1000,
    pointsReward: 200,
    type: 'packaging' as const,
  },
]
