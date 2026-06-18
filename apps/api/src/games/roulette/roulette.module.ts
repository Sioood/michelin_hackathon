import { Module } from '@nestjs/common'

import { LoyaltyModule } from '../../loyalty/loyalty.module'

import { RouletteController } from './roulette.controller'
import { RouletteService } from './roulette.service'

@Module({
  controllers: [RouletteController],
  imports: [LoyaltyModule],
  providers: [RouletteService],
})
export class RouletteModule {}
