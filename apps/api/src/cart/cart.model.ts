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

import { CartItem } from './cart-item.model'

export type CartStatus = 'active' | 'ordered'

export interface CartAttributes {
  id?: number
  guestId: string | null
  status: CartStatus
  userId: number | null
  createdAt?: Date
  updatedAt?: Date
}

export type CartCreationAttributes = Omit<
  CartAttributes,
  'createdAt' | 'id' | 'status' | 'updatedAt'
> &
  Partial<Pick<CartAttributes, 'status'>>

@Table({
  indexes: [{ fields: ['guest_id'] }, { fields: ['user_id'] }],
  tableName: 'carts',
  underscored: true,
})
export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  declare userId: number | null

  @Column(DataType.STRING(120))
  declare guestId: string | null

  @Column({
    allowNull: false,
    defaultValue: 'active',
    type: DataType.STRING(24),
  })
  declare status: CartStatus

  @BelongsTo(() => User)
  declare user?: User

  @HasMany(() => CartItem)
  declare items?: CartItem[]
}
