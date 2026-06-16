import { Injectable, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Product } from './product.model'
import { seedProducts } from './products.seed'

import type { ProductAttributes } from './product.model'

export type ProductDto = ProductAttributes

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async onModuleInit(): Promise<void> {
    const productCount = await this.productModel.count()
    if (productCount === seedProducts.length) {
      return
    }

    await this.productModel.truncate({ cascade: true, restartIdentity: true })
    await this.productModel.bulkCreate(seedProducts, { validate: true })
  }

  async findAll(): Promise<ProductDto[]> {
    const products = await this.productModel.findAll({
      order: [
        ['category', 'ASC'],
        ['rangeName', 'ASC'],
        ['designation', 'ASC'],
      ],
    })

    return products.map((product) => product.toJSON<ProductDto>())
  }
}
