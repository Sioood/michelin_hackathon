import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { Product } from '../products/product.model'
import { ProductsService } from '../products/products.service'

import { CartItem } from './cart-item.model'
import { Cart } from './cart.model'

import type { PublicUserDto } from '../users/users.service'

export interface CartLineDto {
  id: number
  product: Product
  productId: number
  quantity: number
  subtotalCents: number
}

export interface CartDto {
  currency: 'EUR'
  guestId: string | null
  id: number
  items: CartLineDto[]
  totalCents: number
  userId: number | null
}

interface CartIdentity {
  guestId: string | null
  user: PublicUserDto | null
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart)
    private readonly cartModel: typeof Cart,
    @InjectModel(CartItem)
    private readonly cartItemModel: typeof CartItem,
    private readonly productsService: ProductsService,
  ) {}

  async getCart(identity: CartIdentity): Promise<CartDto> {
    const cart = await this.findOrCreateActiveCart(identity)

    return this.toDto(cart)
  }

  async addItem(identity: CartIdentity, productId: number, quantity: number): Promise<CartDto> {
    const product = await this.productsService.findModelById(productId)

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock')
    }

    const cart = await this.findOrCreateActiveCart(identity)
    const cartId = this.requireCartId(cart)
    const existingItem = await this.cartItemModel.findOne({ where: { cartId, productId } })

    if (existingItem === null) {
      await this.cartItemModel.create({ cartId, productId, quantity })
    } else {
      const nextQuantity = existingItem.quantity + quantity

      if (product.stock < nextQuantity) {
        throw new BadRequestException('Insufficient stock')
      }

      await existingItem.update({ quantity: nextQuantity })
    }

    return this.getCart(identity)
  }

  async updateItem(identity: CartIdentity, itemId: number, quantity: number): Promise<CartDto> {
    const cart = await this.findOrCreateActiveCart(identity)
    const item = await this.findCartItem(cart, itemId)

    if (item.product !== undefined && item.product.stock < quantity) {
      throw new BadRequestException('Insufficient stock')
    }

    await item.update({ quantity })

    return this.getCart(identity)
  }

  async removeItem(identity: CartIdentity, itemId: number): Promise<CartDto> {
    const cart = await this.findOrCreateActiveCart(identity)
    const item = await this.findCartItem(cart, itemId)
    await item.destroy()

    return this.getCart(identity)
  }

  async markOrdered(userId: number): Promise<Cart | null> {
    const cart = await this.cartModel.findOne({
      where: { status: 'active', userId },
    })

    if (cart === null) {
      return null
    }

    await cart.update({ status: 'ordered' })

    return cart
  }

  async getActiveCartForUser(userId: number): Promise<Cart | null> {
    return this.cartModel.findOne({
      include: [{ include: [Product], model: CartItem }],
      where: { status: 'active', userId },
    })
  }

  private async findOrCreateActiveCart(identity: CartIdentity): Promise<Cart> {
    const userId = identity.user?.id ?? null

    if (userId !== null) {
      const [cart] = await this.cartModel.findOrCreate({
        defaults: { guestId: null, userId },
        where: { status: 'active', userId },
      })

      return this.reloadCart(cart)
    }

    if (identity.guestId === null || identity.guestId.length === 0) {
      throw new BadRequestException('Guest cart requires x-guest-cart-id header')
    }

    const [cart] = await this.cartModel.findOrCreate({
      defaults: { guestId: identity.guestId, userId: null },
      where: { guestId: identity.guestId, status: 'active' },
    })

    return this.reloadCart(cart)
  }

  private async findCartItem(cart: Cart, itemId: number): Promise<CartItem> {
    const item = await this.cartItemModel.findOne({
      include: [Product],
      where: {
        cartId: this.requireCartId(cart),
        id: itemId,
      },
    })

    if (item === null) {
      throw new NotFoundException('Cart item not found')
    }

    return item
  }

  private requireCartId(cart: Cart): number {
    if (cart.id === undefined) {
      throw new BadRequestException('Invalid cart')
    }

    return cart.id
  }

  private async reloadCart(cart: Cart): Promise<Cart> {
    const cartId = this.requireCartId(cart)
    const reloadedCart = await this.cartModel.findByPk(cartId, {
      include: [{ include: [Product], model: CartItem }],
    })

    if (reloadedCart === null) {
      throw new NotFoundException('Cart not found')
    }

    return reloadedCart
  }

  private toDto(cart: Cart): CartDto {
    const cartId = this.requireCartId(cart)
    const items =
      cart.items?.map((item) => {
        if (item.id === undefined || item.product === undefined) {
          throw new BadRequestException('Invalid cart item')
        }

        return {
          id: item.id,
          product: item.product,
          productId: item.productId,
          quantity: item.quantity,
          subtotalCents: item.quantity * item.product.priceCents,
        }
      }) ?? []

    return {
      currency: 'EUR',
      guestId: cart.guestId,
      id: cartId,
      items,
      totalCents: items.reduce((total, item) => total + item.subtotalCents, 0),
      userId: cart.userId,
    }
  }
}
