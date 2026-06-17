import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Product } from '../products/product.model'

import { Order } from './order.model'

export interface OrderItemAttributes {
  id?: number
  orderId: number
  productId: number
  productName: string
  quantity: number
  totalCents: number
  unitPriceCents: number
  createdAt?: Date
  updatedAt?: Date
}

export type OrderItemCreationAttributes = Omit<
  OrderItemAttributes,
  'createdAt' | 'id' | 'updatedAt'
>

@Table({
  tableName: 'order_items',
  underscored: true,
})
export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => Order)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare orderId: number

  @ForeignKey(() => Product)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare productId: number

  @Column({
    allowNull: false,
    type: DataType.STRING(260),
  })
  declare productName: string

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare quantity: number

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare unitPriceCents: number

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare totalCents: number

  @BelongsTo(() => Order)
  declare order?: Order

  @BelongsTo(() => Product)
  declare product?: Product
}
