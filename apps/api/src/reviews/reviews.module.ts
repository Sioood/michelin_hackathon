import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { ProductsModule } from '../products/products.module'

import { Review } from './review.model'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'

@Module({
  controllers: [ReviewsController],
  imports: [SequelizeModule.forFeature([Review]), ProductsModule],
  providers: [ReviewsService],
})
export class ReviewsModule {}
