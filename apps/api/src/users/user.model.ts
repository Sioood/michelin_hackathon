import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'

import { Cart } from '../cart/cart.model'
import { Order } from '../orders/order.model'

export interface UserAttributes {
  id?: number
  email: string
  firstName: string | null
  lastName: string | null
  passwordHash: string
  createdAt?: Date
  updatedAt?: Date
}

export type UserCreationAttributes = Omit<UserAttributes, 'createdAt' | 'id' | 'updatedAt'>

@Table({
  tableName: 'users',
  underscored: true,
})
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @Column({
    allowNull: false,
    type: DataType.STRING(180),
    unique: true,
  })
  declare email: string

  @Column(DataType.STRING(100))
  declare firstName: string | null

  @Column(DataType.STRING(100))
  declare lastName: string | null

  @Column({
    allowNull: false,
    type: DataType.STRING(120),
  })
  declare passwordHash: string

  @HasMany(() => Cart)
  declare carts?: Cart[]

  @HasMany(() => Order)
  declare orders?: Order[]
}
