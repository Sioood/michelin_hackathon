import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { Product } from './product.model'
import { seedProducts } from './products.seed'
import { enrichProductSeed } from './seed-prices'

import type { ProductAttributes } from './product.model'
import type { WhereOptions } from 'sequelize'

export type ProductDto = ProductAttributes

export interface ProductFilters {
  category?: string
  diameter?: string
  search?: string
  terrain?: string
}

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
    await this.productModel.bulkCreate(seedProducts.map(enrichProductSeed), { validate: true })
  }

  async findAll(filters: ProductFilters = {}): Promise<ProductDto[]> {
    const where = this.createWhere(filters)
    const products = await this.productModel.findAll({
      order: [
        ['category', 'ASC'],
        ['rangeName', 'ASC'],
        ['designation', 'ASC'],
      ],
      where,
    })

    return products.map((product) => product.toJSON<ProductDto>())
  }

  async findBySlug(slug: string): Promise<ProductDto> {
    const product = await this.productModel.findOne({ where: { slug } })

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    return product.toJSON<ProductDto>()
  }

  async findBySlugs(slugs: string[]): Promise<ProductDto[]> {
    const products = await this.productModel.findAll({ where: { slug: slugs } })
    const productsBySlug = new Map(
      products.map((product) => [product.slug, product.toJSON<ProductDto>()]),
    )
    const missingSlugs = slugs.filter((slug) => !productsBySlug.has(slug))

    if (missingSlugs.length > 0) {
      throw new NotFoundException(`Products not found: ${missingSlugs.join(', ')}`)
    }

    return slugs.map((slug) => {
      const product = productsBySlug.get(slug)

      if (product === undefined) {
        throw new NotFoundException(`Product not found: ${slug}`)
      }

      return product
    })
  }

  async findModelById(id: number): Promise<Product> {
    const product = await this.productModel.findByPk(id)

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    return product
  }

  private createWhere(filters: ProductFilters): WhereOptions<ProductAttributes> {
    const conditions: WhereOptions<ProductAttributes>[] = []

    if (filters.category !== undefined && filters.category.length > 0) {
      conditions.push({ category: filters.category })
    }

    if (filters.diameter !== undefined && filters.diameter.length > 0) {
      conditions.push({
        [Op.or]: [{ webDiameterMm: filters.diameter }, { webDiameterInch: filters.diameter }],
      } as WhereOptions<ProductAttributes>)
    }

    if (filters.terrain !== undefined && filters.terrain.length > 0) {
      conditions.push({
        terrainTypes: { [Op.overlap]: [filters.terrain.toUpperCase()] },
      } as WhereOptions<ProductAttributes>)
    }

    if (filters.search !== undefined && filters.search.length > 0) {
      const search = `%${filters.search}%`
      conditions.push({
        [Op.or]: [
          { designation: { [Op.iLike]: search } },
          { rangeName: { [Op.iLike]: search } },
          { headline: { [Op.iLike]: search } },
          { description: { [Op.iLike]: search } },
        ],
      } as WhereOptions<ProductAttributes>)
    }

    if (conditions.length === 0) {
      return {}
    }

    return { [Op.and]: conditions } as WhereOptions<ProductAttributes>
  }
}
