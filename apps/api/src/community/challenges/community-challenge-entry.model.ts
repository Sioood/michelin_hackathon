import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { User } from '../../users/user.model'

import { CommunityChallenge } from './community-challenge.model'

export interface CommunityChallengeEntryAttributes {
  id?: number
  challengeId: number
  note: string | null
  score: number
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export type CommunityChallengeEntryCreationAttributes = Omit<
  CommunityChallengeEntryAttributes,
  'createdAt' | 'id' | 'updatedAt'
>

@Table({
  indexes: [{ fields: ['challenge_id', 'user_id'], unique: true }],
  tableName: 'community_challenge_entries',
  underscored: true,
})
export class CommunityChallengeEntry
  extends Model<CommunityChallengeEntryAttributes, CommunityChallengeEntryCreationAttributes>
  implements CommunityChallengeEntryAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => CommunityChallenge)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare challengeId: number

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare userId: number

  @Column({
    allowNull: false,
    type: DataType.FLOAT,
  })
  declare score: number

  @Column(DataType.STRING(220))
  declare note: string | null

  @BelongsTo(() => CommunityChallenge)
  declare challenge?: CommunityChallenge

  @BelongsTo(() => User)
  declare user?: User
}
