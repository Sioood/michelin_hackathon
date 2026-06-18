import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript'

import { User } from '../users/user.model'

import { LoyaltyTransaction } from './loyalty-transaction.model'

export interface PendingDiscount {
  createdAt: string
  id: string
  source: 'reward' | 'roulette'
  type: 'fixed_cents' | 'free_shipping' | 'percent'
  used: boolean
  value: number
}

export interface LoyaltyAccountAttributes {
  id?: number
  balance: number
  lastRouletteSpinAt: Date | null
  pendingDiscounts: PendingDiscount[]
  referralCode: string
  referredByUserId: number | null
  stripeWelcomeCouponId: string | null
  userId: number
  welcomeDiscountUsed: boolean
  createdAt?: Date
  updatedAt?: Date
}

export type LoyaltyAccountCreationAttributes = Omit<
  LoyaltyAccountAttributes,
  | 'balance'
  | 'createdAt'
  | 'id'
  | 'lastRouletteSpinAt'
  | 'pendingDiscounts'
  | 'updatedAt'
  | 'welcomeDiscountUsed'
> &
  Partial<
    Pick<
      LoyaltyAccountAttributes,
      'balance' | 'lastRouletteSpinAt' | 'pendingDiscounts' | 'welcomeDiscountUsed'
    >
  >

@Table({
  indexes: [
    { fields: ['user_id'], unique: true },
    { fields: ['referral_code'], unique: true },
  ],
  tableName: 'loyalty_accounts',
  underscored: true,
})
export class LoyaltyAccount
  extends Model<LoyaltyAccountAttributes, LoyaltyAccountCreationAttributes>
  implements LoyaltyAccountAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    unique: true,
  })
  declare userId: number

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  declare balance: number

  @Column({
    allowNull: false,
    type: DataType.STRING(32),
    unique: true,
  })
  declare referralCode: string

  @Column(DataType.INTEGER)
  declare referredByUserId: number | null

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare welcomeDiscountUsed: boolean

  @Column(DataType.STRING(120))
  declare stripeWelcomeCouponId: string | null

  @Column(DataType.DATE)
  declare lastRouletteSpinAt: Date | null

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.JSONB,
  })
  declare pendingDiscounts: PendingDiscount[]

  @BelongsTo(() => User)
  declare user?: User

  @HasMany(() => LoyaltyTransaction)
  declare transactions?: LoyaltyTransaction[]
}
