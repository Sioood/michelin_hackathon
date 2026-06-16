import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Product } from './product.model'
import { seedProducts } from './products.seed'

export interface ProductDto {
  id: number | undefined
  name: string
  slug: string
  category: string
  headline: string
  description: string
  imageUrl: string
  usages: string[]
  sizes: string[]
  technologies: string[]
  tubelessReady: boolean
  eBikeReady: boolean
  priceFrom: number
}

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async onModuleInit(): Promise<void> {
    const productCount = await this.productModel.count()
    if (productCount > 0) {
      return
    }

    await this.productModel.bulkCreate(seedProducts, { validate: true })
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productModel.findAll({
      order: [
        ['category', 'ASC'],
        ['name', 'ASC'],
      ],
    })

    return products.map((product) => ({
      category: product.category,
      description: product.description,
      eBikeReady: product.eBikeReady,
      headline: product.headline,
      id: product.id,
      imageUrl: product.imageUrl,
      name: product.name,
      priceFrom: product.priceFrom,
      sizes: product.sizes,
      slug: product.slug,
      technologies: product.technologies,
      tubelessReady: product.tubelessReady,
      usages: product.usages,
    }))
  }
}
