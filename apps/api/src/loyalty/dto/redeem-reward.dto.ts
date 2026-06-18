import { IsString, MaxLength } from 'class-validator'

export class RedeemRewardDto {
  @IsString()
  @MaxLength(64)
  declare rewardId: string
}
