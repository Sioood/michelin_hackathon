import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { CrossSellModule } from '../cross-sell/cross-sell.module'

import { Product } from './product.model'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  controllers: [ProductsController],
  exports: [ProductsService],
  imports: [CrossSellModule, SequelizeModule.forFeature([Product])],
  providers: [ProductsService],
})
export class ProductsModule {}
