import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript'

import { User } from '../../users/user.model'
import { CommunityPost } from '../community-post.model'

export interface CommunityPostReportAttributes {
  id?: number
  postId: number
  reason: string
  userId: number
  createdAt?: Date
  updatedAt?: Date
}

export type CommunityPostReportCreationAttributes = Omit<
  CommunityPostReportAttributes,
  'createdAt' | 'id' | 'updatedAt'
>

@Table({
  indexes: [{ fields: ['post_id', 'user_id'], unique: true }],
  tableName: 'community_post_reports',
  underscored: true,
})
export class CommunityPostReport
  extends Model<CommunityPostReportAttributes, CommunityPostReportCreationAttributes>
  implements CommunityPostReportAttributes
{
  @Column({
    autoIncrement: true,
    primaryKey: true,
    type: DataType.INTEGER,
  })
  declare id?: number

  @ForeignKey(() => CommunityPost)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare postId: number

  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  declare userId: number

  @Column({
    allowNull: false,
    type: DataType.STRING(220),
  })
  declare reason: string

  @BelongsTo(() => CommunityPost)
  declare post?: CommunityPost

  @BelongsTo(() => User)
  declare user?: User
}
