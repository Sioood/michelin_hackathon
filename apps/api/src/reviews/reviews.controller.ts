import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { CreateReviewDto } from './dto/create-review.dto'
import { UpdateReviewDto } from './dto/update-review.dto'
import { ReviewsService } from './reviews.service'

import type { ReviewDto } from './reviews.service'
import type { PublicUserDto } from '../users/users.service'

interface ReviewParams {
  productId: string
  reviewId: string
}

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

  @Patch(':reviewId')
  @UseGuards(JwtAuthGuard)
  update(
    @Param() params: ReviewParams,
    @Body() input: UpdateReviewDto,
    @CurrentUser() user: PublicUserDto,
  ): Promise<ReviewDto> {
    return this.reviewsService.update({
      input,
      productId: this.parseId(params.productId),
      reviewId: this.parseId(params.reviewId),
      userId: user.id as number,
    })
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param() params: ReviewParams,
    @CurrentUser() user: PublicUserDto,
  ): Promise<{ deleted: true }> {
    await this.reviewsService.remove(
      this.parseId(params.productId),
      this.parseId(params.reviewId),
      user.id as number,
    )

    return { deleted: true }
  }

  private parseId(value: string): number {
    const parsed = Number(value)

    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException('Invalid id')
    }

    return parsed
  }
}
