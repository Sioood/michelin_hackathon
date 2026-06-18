import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { Product } from '../products/product.model'
import { User } from '../users/user.model'

export interface ReviewAttributes {
  id?: number
  productId: number
  userId: number
  rating: number
  title: string | null
  body: string | null
  createdAt?: Date
  updatedAt?: Date
}

export type ReviewCreationAttributes = Omit<ReviewAttributes, 'createdAt' | 'id' | 'updatedAt'>

@Table({
  indexes: [
    { fields: ['product_id'] },
    { fields: ['user_id'] },
    { fields: ['product_id', 'user_id'], unique: true },
  ],
  tableName: 'reviews',
  underscored: true,
})
export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => Product)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare productId: number

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare userId: number

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    validate: { max: 5, min: 1 },
  })
  declare rating: number

  @Column(DataType.STRING(160))
  declare title: string | null

  @Column(DataType.TEXT)
  declare body: string | null

  @BelongsTo(() => Product)
  declare product?: Product

  @BelongsTo(() => User)
  declare user?: User
}
