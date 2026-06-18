import { BadRequestException, NotFoundException } from '@nestjs/common'

import { ProductsService } from '../products/products.service'

import { Review } from './review.model'
import { ReviewsService } from './reviews.service'

describe('ReviewsService', () => {
  const productsService = {
    findModelById: jest.fn(),
  } as unknown as ProductsService

  it('rejects an empty update', async () => {
    const reviewModel = {
      findOne: jest.fn(),
    } as unknown as typeof Review
    const service = new ReviewsService(reviewModel, productsService)

    await expect(
      service.update({ input: {}, productId: 1, reviewId: 2, userId: 3 }),
    ).rejects.toThrow(BadRequestException)
    expect(reviewModel.findOne).not.toHaveBeenCalled()
  })

  it('only updates a review owned by the authenticated user', async () => {
    const reviewModel = {
      findOne: jest.fn().mockResolvedValue(null),
    } as unknown as typeof Review
    const service = new ReviewsService(reviewModel, productsService)

    await expect(
      service.update({
        input: { rating: 4 },
        productId: 1,
        reviewId: 2,
        userId: 3,
      }),
    ).rejects.toThrow(NotFoundException)
    expect(reviewModel.findOne).toHaveBeenCalledWith({
      where: { id: 2, productId: 1, userId: 3 },
    })
  })
})
