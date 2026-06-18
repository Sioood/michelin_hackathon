import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'

import { PromoRedemption } from './promo-redemption.model'

export type PromoCodeType = 'packaging' | 'qr'

export interface PromoCodeAttributes {
  id?: number
  code: string
  currentRedemptions: number
  description: string
  isActive: boolean
  maxRedemptions: number | null
  pointsReward: number
  type: PromoCodeType
  createdAt?: Date
  updatedAt?: Date
}

export type PromoCodeCreationAttributes = Omit<
  PromoCodeAttributes,
  'createdAt' | 'currentRedemptions' | 'id' | 'updatedAt'
> &
  Partial<Pick<PromoCodeAttributes, 'currentRedemptions'>>

@Table({
  indexes: [{ fields: ['code'], unique: true }],
  tableName: 'promo_codes',
  underscored: true,
})
export class PromoCode
  extends Model<PromoCodeAttributes, PromoCodeCreationAttributes>
  implements PromoCodeAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @Column({
    allowNull: false,
    type: DataType.STRING(48),
    unique: true,
  })
  declare code: string

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare pointsReward: number

  @Column({
    allowNull: false,
    type: DataType.STRING(32),
  })
  declare type: PromoCodeType

  @Column({
    allowNull: false,
    type: DataType.STRING(260),
  })
  declare description: string

  @Column(DataType.INTEGER)
  declare maxRedemptions: number | null

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  declare currentRedemptions: number

  @Column({
    allowNull: false,
    defaultValue: true,
    type: DataType.BOOLEAN,
  })
  declare isActive: boolean

  @HasMany(() => PromoRedemption)
  declare redemptions?: PromoRedemption[]
}
