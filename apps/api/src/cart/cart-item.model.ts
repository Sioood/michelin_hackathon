import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Product } from '../products/product.model'

import { Cart } from './cart.model'

export interface CartItemAttributes {
  id?: number
  cartId: number
  productId: number
  quantity: number
  createdAt?: Date
  updatedAt?: Date
}

export type CartItemCreationAttributes = Omit<CartItemAttributes, 'createdAt' | 'id' | 'updatedAt'>

@Table({
  indexes: [{ fields: ['cart_id', 'product_id'], unique: true }],
  tableName: 'cart_items',
  underscored: true,
})
export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => Cart)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare cartId: number

  @ForeignKey(() => Product)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare productId: number

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare quantity: number

  @BelongsTo(() => Cart)
  declare cart?: Cart

  @BelongsTo(() => Product)
  declare product?: Product
}
