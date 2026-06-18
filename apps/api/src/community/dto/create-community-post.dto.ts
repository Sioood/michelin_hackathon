import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

import type { CommunityPostType } from '../community-post.model'

const communityPostTypes: CommunityPostType[] = ['challenge', 'opinion', 'photo', 'test', 'video']

export class CreateCommunityPostDto {
  @IsIn(communityPostTypes)
  declare type: CommunityPostType

  @IsString()
  @MaxLength(140)
  declare title: string

  @IsString()
  @MaxLength(3000)
  declare body: string

  @IsOptional()
  @IsString()
  @MaxLength(260)
  declare mediaUrl?: string

  @IsOptional()
  @IsInt()
  @Min(1)
  declare challengeId?: number
}
