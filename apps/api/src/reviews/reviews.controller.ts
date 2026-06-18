import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { CreateReviewDto } from './dto/create-review.dto'
import { ReviewsService } from './reviews.service'

import type { ReviewDto } from './reviews.service'
import type { PublicUserDto } from '../users/users.service'

@Controller('products/:productId/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Param('productId', ParseIntPipe) productId: number): Promise<ReviewDto[]> {
    return this.reviewsService.findAllForProduct(productId)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() input: CreateReviewDto,
    @CurrentUser() user: PublicUserDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.create(productId, user.id as number, input)
  }
}
