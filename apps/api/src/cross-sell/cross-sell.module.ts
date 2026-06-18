import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Product } from '../products/product.model'

import { CrossSellService } from './cross-sell.service'

@Module({
  exports: [CrossSellService],
  imports: [SequelizeModule.forFeature([Product])],
  providers: [CrossSellService],
})
export class CrossSellModule {}
