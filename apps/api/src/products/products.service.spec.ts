import { NotFoundException } from '@nestjs/common'

import { Product } from './product.model'
import { ProductsService } from './products.service'

import type { ProductDto } from './products.service'

function createProduct(slug: string): Product {
  const dto = { slug } as ProductDto

  return {
    slug,
    toJSON: () => dto,
  } as unknown as Product
}

describe('ProductsService', () => {
  describe('findBySlugs', () => {
    it('returns products in the requested order', async () => {
      const productA = createProduct('product-a')
      const productB = createProduct('product-b')
      const productModel = {
        findAll: jest.fn().mockResolvedValue([productB, productA]),
      } as unknown as typeof Product
      const service = new ProductsService(productModel)

      const result = await service.findBySlugs(['product-a', 'product-b'])

      expect(result.map((product) => product.slug)).toEqual(['product-a', 'product-b'])
    })

    it('rejects the comparison when a product is missing', async () => {
      const productModel = {
        findAll: jest.fn().mockResolvedValue([createProduct('product-a')]),
      } as unknown as typeof Product
      const service = new ProductsService(productModel)

      await expect(service.findBySlugs(['product-a', 'product-b'])).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
