import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { User } from '../users/user.model'

import { PromoCode } from './promo-code.model'

export interface PromoRedemptionAttributes {
  id?: number
  promoCodeId: number
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export type PromoRedemptionCreationAttributes = Omit<
  PromoRedemptionAttributes,
  'createdAt' | 'id' | 'updatedAt'
>

@Table({
  indexes: [{ fields: ['promo_code_id', 'user_id'], unique: true }],
  tableName: 'promo_redemptions',
  underscored: true,
})
export class PromoRedemption
  extends Model<PromoRedemptionAttributes, PromoRedemptionCreationAttributes>
  implements PromoRedemptionAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => PromoCode)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare promoCodeId: number

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare userId: number

  @BelongsTo(() => PromoCode)
  declare promoCode?: PromoCode

  @BelongsTo(() => User)
  declare user?: User
}
