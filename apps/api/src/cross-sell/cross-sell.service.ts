import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { Product } from '../products/product.model'

import type { ProductCategory, ProductAttributes } from '../products/product.model'
import type { ProductDto } from '../products/products.service'
import type { WhereOptions } from 'sequelize'

const TIRE_CATEGORIES: ProductCategory[] = [
  'commuting-tour',
  'e-bike',
  'gravel',
  'kids',
  'mtb',
  'road',
]

@Injectable()
export class CrossSellService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}

  async findForProduct(productId: number): Promise<ProductDto[]> {
    const product = await this.productModel.findByPk(productId)

    if (product === null) {
      throw new NotFoundException('Product not found')
    }

    if (product.category === 'inner-tubes') {
      return this.findTiresForInnerTube(product)
    }

    const suggestions: Product[] = []
    const innerTubes = await this.findInnerTubesForTire(product)
    const complementaryTires = await this.findComplementaryTires(product)

    suggestions.push(...innerTubes, ...complementaryTires)

    return this.deduplicateProducts(suggestions)
      .slice(0, 8)
      .map((item) => item.toJSON<ProductDto>())
  }

  private async findInnerTubesForTire(product: Product): Promise<Product[]> {
    const diameter = product.diameterEtrto ?? product.webDiameterMm

    if (diameter === null) {
      return []
    }

    const width = product.widthEtrto

    const conditions: WhereOptions<ProductAttributes>[] = [
      { category: 'inner-tubes' },
      { stock: { [Op.gt]: 0 } },
      {
        [Op.or]: [{ diameterEtrto: diameter }, { webDiameterMm: { [Op.iLike]: `%${diameter}%` } }],
      } as WhereOptions<ProductAttributes>,
    ]

    if (width !== null) {
      conditions.push({
        [Op.or]: [{ widthEtrto: width }, { webWidthMm: { [Op.iLike]: `%${width}%` } }],
      } as WhereOptions<ProductAttributes>)
    }

    return this.productModel.findAll({
      limit: 4,
      order: [['priceCents', 'ASC']],
      where: { [Op.and]: conditions } as WhereOptions<ProductAttributes>,
    })
  }

  private async findComplementaryTires(product: Product): Promise<Product[]> {
    const diameter = product.diameterEtrto ?? product.webDiameterMm

    if (diameter === null || !TIRE_CATEGORIES.includes(product.category)) {
      return []
    }

    return this.productModel.findAll({
      limit: 4,
      order: [['priceCents', 'ASC']],
      where: {
        category: product.category,
        id: { [Op.ne]: product.id },
        rangeName: { [Op.ne]: product.rangeName },
        stock: { [Op.gt]: 0 },
        [Op.or]: [{ diameterEtrto: diameter }, { webDiameterMm: { [Op.iLike]: `%${diameter}%` } }],
      } as WhereOptions<ProductAttributes>,
    })
  }

  private async findTiresForInnerTube(innerTube: Product): Promise<ProductDto[]> {
    const diameter = innerTube.diameterEtrto ?? innerTube.webDiameterMm

    if (diameter === null) {
      return []
    }

    const tires = await this.productModel.findAll({
      limit: 8,
      order: [['priceCents', 'ASC']],
      where: {
        category: { [Op.in]: TIRE_CATEGORIES },
        stock: { [Op.gt]: 0 },
        [Op.or]: [{ diameterEtrto: diameter }, { webDiameterMm: { [Op.iLike]: `%${diameter}%` } }],
      } as WhereOptions<ProductAttributes>,
    })

    return tires.map((item) => item.toJSON<ProductDto>())
  }

  private deduplicateProducts(products: Product[]): Product[] {
    const seen = new Set<number>()
    const result: Product[] = []

    for (const product of products) {
      if (product.id === undefined || seen.has(product.id)) {
        continue
      }

      seen.add(product.id)
      result.push(product)
    }

    return result
  }
}
