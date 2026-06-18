import { Type } from 'class-transformer'
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator'

import type { CommunityPostType } from '../community-post.model'

const communityPostTypes: CommunityPostType[] = ['challenge', 'opinion', 'photo', 'test', 'video']

export class CommunityFeedQueryDto {
  @IsOptional()
  @IsIn(communityPostTypes)
  declare type?: CommunityPostType

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  declare page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Max(50)
  @Min(1)
  declare limit?: number
}
