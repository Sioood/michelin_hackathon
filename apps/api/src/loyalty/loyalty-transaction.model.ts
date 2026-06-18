import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { LoyaltyAccount } from './loyalty-account.model'

export type LoyaltyTransactionType =
  | 'purchase'
  | 'promo_redeem'
  | 'referral_bonus'
  | 'referral_invitee'
  | 'reward_redeem'
  | 'roulette'
  | 'signup_bonus'

export interface LoyaltyTransactionAttributes {
  id?: number
  amount: number
  description: string
  loyaltyAccountId: number
  orderId: number | null
  type: LoyaltyTransactionType
  createdAt?: Date
  updatedAt?: Date
}

export type LoyaltyTransactionCreationAttributes = Omit<
  LoyaltyTransactionAttributes,
  'createdAt' | 'id' | 'orderId' | 'updatedAt'
> &
  Partial<Pick<LoyaltyTransactionAttributes, 'orderId'>>

@Table({
  indexes: [{ fields: ['loyalty_account_id'] }],
  tableName: 'loyalty_transactions',
  underscored: true,
})
export class LoyaltyTransaction
  extends Model<LoyaltyTransactionAttributes, LoyaltyTransactionCreationAttributes>
  implements LoyaltyTransactionAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => LoyaltyAccount)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare loyaltyAccountId: number

  @Column({
    allowNull: false,
    type: DataType.STRING(32),
  })
  declare type: LoyaltyTransactionType

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare amount: number

  @Column({
    allowNull: false,
    type: DataType.STRING(260),
  })
  declare description: string

  @Column(DataType.INTEGER)
  declare orderId: number | null

  @BelongsTo(() => LoyaltyAccount)
  declare loyaltyAccount?: LoyaltyAccount
}
