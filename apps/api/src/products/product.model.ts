import { Column, DataType, Model, Table } from 'sequelize-typescript'

export type ProductCategory = 'road' | 'gravel' | 'mtb' | 'e-bike' | 'city' | 'kids'

export interface ProductAttributes {
  id?: number
  name: string
  slug: string
  category: ProductCategory
  headline: string
  description: string
  imageUrl: string
  usages: string[]
  sizes: string[]
  technologies: string[]
  tubelessReady: boolean
  eBikeReady: boolean
  priceFrom: number
  createdAt?: Date
  updatedAt?: Date
}

type ProductCreationAttributes = Omit<ProductAttributes, 'createdAt' | 'id' | 'updatedAt'>

@Table({
  tableName: 'products',
  underscored: true,
})
export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @Column({
    allowNull: false,
    type: DataType.STRING(120),
  })
  declare name: string

  @Column({
    allowNull: false,
    type: DataType.STRING(140),
    unique: true,
  })
  declare slug: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  declare category: ProductCategory

  @Column({
    allowNull: false,
    type: DataType.STRING(180),
  })
  declare headline: string

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare description: string

  @Column({
    allowNull: false,
    type: DataType.STRING(500),
  })
  declare imageUrl: string

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare usages: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare sizes: string[]

  @Column({
    allowNull: false,
    defaultValue: [],
    type: DataType.ARRAY(DataType.STRING),
  })
  declare technologies: string[]

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare tubelessReady: boolean

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare eBikeReady: boolean

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare priceFrom: number
}
