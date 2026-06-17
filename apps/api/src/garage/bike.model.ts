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

import { BikeTireInstallation } from './bike-tire-installation.model'

export type BikeType = 'city' | 'e-bike' | 'gravel' | 'mtb' | 'road'

export interface BikeAttributes {
  id?: number
  annualDistanceKm: number
  brand: string | null
  model: string | null
  name: string
  type: BikeType
  userId: number
  wheelDiameter: string | null
  createdAt?: Date
  updatedAt?: Date
}

export type BikeCreationAttributes = Omit<
  BikeAttributes,
  'annualDistanceKm' | 'brand' | 'createdAt' | 'id' | 'model' | 'updatedAt' | 'wheelDiameter'
> &
  Partial<Pick<BikeAttributes, 'annualDistanceKm' | 'brand' | 'model' | 'wheelDiameter'>>

@Table({
  indexes: [{ fields: ['user_id'] }],
  tableName: 'bikes',
  underscored: true,
})
export class Bike extends Model<BikeAttributes, BikeCreationAttributes> implements BikeAttributes {
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
    type: DataType.STRING(120),
  })
  declare name: string

  @Column({
    allowNull: false,
    type: DataType.STRING(24),
  })
  declare type: BikeType

  @Column(DataType.STRING(80))
  declare brand: string | null

  @Column(DataType.STRING(120))
  declare model: string | null

  @Column(DataType.STRING(24))
  declare wheelDiameter: string | null

  @Column({
    allowNull: false,
    defaultValue: 2500,
    type: DataType.INTEGER,
  })
  declare annualDistanceKm: number

  @BelongsTo(() => User)
  declare user?: User

  @HasMany(() => BikeTireInstallation)
  declare tireInstallations?: BikeTireInstallation[]
}
