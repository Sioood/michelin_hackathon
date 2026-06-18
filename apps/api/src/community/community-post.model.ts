import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { User } from '../users/user.model'

export type CommunityPostType = 'challenge' | 'opinion' | 'photo' | 'test' | 'video'

export interface CommunityPostAttributes {
  id?: number
  body: string
  challengeId: number | null
  hidden: boolean
  mediaUrl: string | null
  reportCount: number
  title: string
  type: CommunityPostType
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export type CommunityPostCreationAttributes = Omit<
  CommunityPostAttributes,
  'createdAt' | 'hidden' | 'id' | 'reportCount' | 'updatedAt'
> &
  Partial<Pick<CommunityPostAttributes, 'hidden' | 'reportCount'>>

@Table({
  indexes: [{ fields: ['type'] }, { fields: ['user_id'] }, { fields: ['hidden'] }],
  tableName: 'community_posts',
  underscored: true,
})
export class CommunityPost
  extends Model<CommunityPostAttributes, CommunityPostCreationAttributes>
  implements CommunityPostAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare userId: number

  @Column({
    allowNull: false,
    type: DataType.STRING(24),
  })
  declare type: CommunityPostType

  @Column({
    allowNull: false,
    type: DataType.STRING(140),
  })
  declare title: string

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  declare body: string

  @Column(DataType.STRING(260))
  declare mediaUrl: string | null

  @Column(DataType.INTEGER)
  declare challengeId: number | null

  @Column({
    allowNull: false,
    defaultValue: 0,
    type: DataType.INTEGER,
  })
  declare reportCount: number

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataType.BOOLEAN,
  })
  declare hidden: boolean

  @BelongsTo(() => User)
  declare user?: User
}
