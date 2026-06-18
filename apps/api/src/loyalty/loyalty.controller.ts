import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { RedeemCodeDto } from './dto/redeem-code.dto'
import { RedeemRewardDto } from './dto/redeem-reward.dto'
import { LoyaltyService } from './loyalty.service'

import type {
  LoyaltyOverviewDto,
  RedeemCodeResultDto,
  RedeemRewardResultDto,
} from './loyalty.service'
import type { PublicUserDto } from '../users/users.service'

@Controller('loyalty')
@UseGuards(JwtAuthGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get()
  getOverview(@CurrentUser() user: PublicUserDto): Promise<LoyaltyOverviewDto> {
    return this.loyaltyService.getOverview(user.id as number)
  }

  @Post('redeem-code')
  redeemCode(
    @Body() input: RedeemCodeDto,
    @CurrentUser() user: PublicUserDto,
  ): Promise<RedeemCodeResultDto> {
    return this.loyaltyService.redeemCode(user.id as number, input.code)
  }

  @Post('redeem-reward')
  redeemReward(
    @Body() input: RedeemRewardDto,
    @CurrentUser() user: PublicUserDto,
  ): Promise<RedeemRewardResultDto> {
    return this.loyaltyService.redeemReward(user.id as number, input.rewardId)
  }
}
