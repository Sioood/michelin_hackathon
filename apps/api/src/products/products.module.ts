import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { Product } from './product.model'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  controllers: [ProductsController],
  imports: [SequelizeModule.forFeature([Product])],
  providers: [ProductsService],
})
export class ProductsModule {}
