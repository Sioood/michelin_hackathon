import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript'

import { CommunityChallengeEntry } from './community-challenge-entry.model'

export type CommunityChallengeMetric = 'distance_km' | 'posts'

export interface CommunityChallengeAttributes {
  id?: number
  description: string
  endsAt: Date
  metric: CommunityChallengeMetric
  startsAt: Date
  title: string
  createdAt?: Date
  updatedAt?: Date
}

export type CommunityChallengeCreationAttributes = Omit<
  CommunityChallengeAttributes,
  'createdAt' | 'id' | 'updatedAt'
>

@Table({
  tableName: 'community_challenges',
  underscored: true,
})
export class CommunityChallenge
  extends Model<CommunityChallengeAttributes, CommunityChallengeCreationAttributes>
  implements CommunityChallengeAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @Column({
    allowNull: false,
    type: DataType.STRING(140),
  })
  declare title: string

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare description: string

  @Column({
    allowNull: false,
    type: DataType.STRING(24),
  })
  declare metric: CommunityChallengeMetric

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  declare startsAt: Date

  @Column({
    allowNull: false,
    type: DataType.DATE,
  })
  declare endsAt: Date

  @HasMany(() => CommunityChallengeEntry)
  declare entries?: CommunityChallengeEntry[]
}
