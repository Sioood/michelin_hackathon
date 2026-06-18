import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { ProductsService } from '../products/products.service'
import { User } from '../users/user.model'

import { Review } from './review.model'

import type { CreateReviewDto } from './dto/create-review.dto'
import type { UpdateReviewDto } from './dto/update-review.dto'
import type { ReviewAttributes } from './review.model'

export interface ReviewDto extends ReviewAttributes {
  userDisplayName: string
}

interface UpdateReviewRequest {
  input: UpdateReviewDto
  productId: number
  reviewId: number
  userId: number
}

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review)
    private readonly reviewModel: typeof Review,
    private readonly productsService: ProductsService,
  ) {}

  async findAllForProduct(productId: number): Promise<ReviewDto[]> {
    const reviews = await this.reviewModel.findAll({
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
      order: [['createdAt', 'DESC']],
      where: { productId },
    })

    return reviews.map((review) => this.toDto(review))
  }

  async create(productId: number, userId: number, input: CreateReviewDto): Promise<ReviewDto> {
    await this.productsService.findModelById(productId)

    const existing = await this.reviewModel.findOne({ where: { productId, userId } })
    if (existing !== null) {
      throw new ConflictException('You have already reviewed this product')
    }

    const review = await this.reviewModel.create({
      body: input.body?.trim() || null,
      productId,
      rating: input.rating,
      title: input.title?.trim() || null,
      userId,
    })

    const withUser = await this.reviewModel.findByPk(review.id, {
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
    })

    if (withUser === null) {
      throw new NotFoundException('Review not found after creation')
    }

    return this.toDto(withUser)
  }

  async update(request: UpdateReviewRequest): Promise<ReviewDto> {
    const { input, productId, reviewId, userId } = request

    if (input.body === undefined && input.rating === undefined && input.title === undefined) {
      throw new BadRequestException('At least one review field is required')
    }

    const review = await this.findOwnedReview(productId, reviewId, userId)
    await review.update({
      body: input.body === undefined ? review.body : input.body.trim() || null,
      rating: input.rating ?? review.rating,
      title: input.title === undefined ? review.title : input.title.trim() || null,
    })

    return this.findReviewDto(reviewId)
  }

  async remove(productId: number, reviewId: number, userId: number): Promise<void> {
    const review = await this.findOwnedReview(productId, reviewId, userId)
    await review.destroy()
  }

  private async findOwnedReview(
    productId: number,
    reviewId: number,
    userId: number,
  ): Promise<Review> {
    const review = await this.reviewModel.findOne({
      where: { id: reviewId, productId, userId },
    })

    if (review === null) {
      throw new NotFoundException('Review not found')
    }

    return review
  }

  private async findReviewDto(reviewId: number): Promise<ReviewDto> {
    const review = await this.reviewModel.findByPk(reviewId, {
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
    })

    if (review === null) {
      throw new NotFoundException('Review not found')
    }

    return this.toDto(review)
  }

  private toDto(review: Review): ReviewDto {
    const json = review.toJSON<
      ReviewAttributes & { user?: { firstName?: string; lastName?: string; email?: string } }
    >()
    const { user, ...rest } = json
    const firstName = user?.firstName ?? ''
    const lastName = user?.lastName ?? ''
    const email = user?.email ?? ''
    const userDisplayName = [firstName, lastName].filter(Boolean).join(' ') || email || 'Anonyme'

    return { ...rest, userDisplayName }
  }
}
