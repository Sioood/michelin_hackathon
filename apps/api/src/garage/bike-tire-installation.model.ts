import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { OrderItem } from '../orders/order-item.model'
import { Order } from '../orders/order.model'
import { Product } from '../products/product.model'

import { Bike } from './bike.model'

export type TirePosition = 'both' | 'front' | 'rear'

export interface BikeTireInstallationAttributes {
  id?: number
  bikeId: number
  currentDistanceKm: number
  distanceKmAtInstall: number
  installedAt: Date
  notes: string | null
  orderId: number | null
  orderItemId: number | null
  position: TirePosition
  productId: number
  createdAt?: Date
  updatedAt?: Date
}

export type BikeTireInstallationCreationAttributes = Omit<
  BikeTireInstallationAttributes,
  | 'createdAt'
  | 'currentDistanceKm'
  | 'distanceKmAtInstall'
  | 'id'
  | 'installedAt'
  | 'notes'
  | 'orderId'
  | 'orderItemId'
  | 'position'
  | 'updatedAt'
> &
  Partial<
    Pick<
      BikeTireInstallationAttributes,
      | 'currentDistanceKm'
      | 'distanceKmAtInstall'
      | 'installedAt'
      | 'notes'
      | 'orderId'
      | 'orderItemId'
      | 'position'
    >
  >

@Table({
  indexes: [{ fields: ['bike_id'] }, { fields: ['product_id'] }],
  tableName: 'bike_tire_installations',
  underscored: true,
})
export class BikeTireInstallation
  extends Model<BikeTireInstallationAttributes, BikeTireInstallationCreationAttributes>
  implements BikeTireInstallationAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => Bike)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare bikeId: number

  @ForeignKey(() => Product)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  declare productId: number

  @ForeignKey(() => Order)
  @Column(DataType.INTEGER)
  declare orderId: number | null

  @ForeignKey(() => OrderItem)
  @Column(DataType.INTEGER)
  declare orderItemId: number | null

  @Column({
    allowNull: false,
    defaultValue: 'both',
    type: DataType.STRING(16),
  })
  declare position: TirePosition

  @Column({
    allowNull: false,
    defaultValue: DataType.NOW,
    type: DataType.DATE,
  })
  declare installedAt: Date

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  declare distanceKmAtInstall: number

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  declare currentDistanceKm: number

  @Column(DataType.STRING(500))
  declare notes: string | null

  @BelongsTo(() => Bike)
  declare bike?: Bike

  @BelongsTo(() => Product)
  declare product?: Product

  @BelongsTo(() => Order)
  declare order?: Order

  @BelongsTo(() => OrderItem)
  declare orderItem?: OrderItem
}
