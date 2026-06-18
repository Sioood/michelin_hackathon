import { Controller, Post, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

import { RouletteService } from './roulette.service'

import type { RouletteSpinResultDto } from './roulette.service'
import type { PublicUserDto } from '../../users/users.service'

@Controller('games/roulette')
@UseGuards(JwtAuthGuard)
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post('spin')
  spin(@CurrentUser() user: PublicUserDto): Promise<RouletteSpinResultDto> {
    return this.rouletteService.spin(user.id as number)
  }
}
