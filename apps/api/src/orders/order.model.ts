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

import { OrderItem } from './order-item.model'

export type OrderStatus = 'paid' | 'pending' | 'shipped'

export interface OrderAttributes {
  id?: number
  currency: 'EUR'
  status: OrderStatus
  stripeSessionId: string | null
  totalCents: number
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export type OrderCreationAttributes = Omit<
  OrderAttributes,
  'createdAt' | 'currency' | 'id' | 'updatedAt'
> &
  Partial<Pick<OrderAttributes, 'currency'>>

@Table({
  indexes: [{ fields: ['user_id'] }, { fields: ['stripe_session_id'] }],
  tableName: 'orders',
  underscored: true,
})
export class Order
  extends Model<OrderAttributes, OrderCreationAttributes>
  implements OrderAttributes
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
  })
  declare userId: number

  @Column({
    allowNull: false,
    defaultValue: 'pending',
    type: DataType.STRING(24),
  })
  declare status: OrderStatus

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare totalCents: number

  @Column({
    allowNull: false,
    defaultValue: 'EUR',
    type: DataType.STRING(3),
  })
  declare currency: 'EUR'

  @Column(DataType.STRING(220))
  declare stripeSessionId: string | null

  @BelongsTo(() => User)
  declare user?: User

  @HasMany(() => OrderItem)
  declare items?: OrderItem[]
}
