type LoyaltyRewardType = 'discount_fixed' | 'discount_percent' | 'free_shipping'

type LoyaltyTransactionType =
  | 'purchase'
  | 'promo_redeem'
  | 'referral_bonus'
  | 'referral_invitee'
  | 'reward_redeem'
  | 'roulette'
  | 'signup_bonus'

interface PendingDiscount {
  createdAt: string
  id: string
  source: 'reward' | 'roulette'
  type: 'fixed_cents' | 'free_shipping' | 'percent'
  used: boolean
  value: number
}

interface LoyaltyReward {
  description: string
  id: string
  name: string
  pointsCost: number
  type: LoyaltyRewardType
  value: number
}

interface LoyaltyTransaction {
  amount: number
  createdAt?: string
  description: string
  id?: number
  orderId: number | null
  type: LoyaltyTransactionType
}

export interface LoyaltyOverview {
  balance: number
  canSpinRoulette: boolean
  lastRouletteSpinAt: string | null
  pendingDiscounts: PendingDiscount[]
  referralCode: string
  rewards: LoyaltyReward[]
  transactions: LoyaltyTransaction[]
  welcomeDiscountAvailable: boolean
}

export interface RedeemCodeResult {
  balance: number
  message: string
  pointsAwarded: number
}

export interface RedeemRewardResult {
  balance: number
  message: string
  pendingDiscount: PendingDiscount
  pointsSpent: number
}

type RoulettePrizeType = 'discount_percent' | 'points'

interface RoulettePrize {
  amount: number
  label: string
  type: RoulettePrizeType
  weight: number
}

export interface RouletteSpinResult {
  balance: number
  canSpinAgainAt: string
  label: string
  prize: RoulettePrize
}
