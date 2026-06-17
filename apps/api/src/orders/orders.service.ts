import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'

import { CartService } from '../cart/cart.service'
import { Product } from '../products/product.model'

import { OrderItem } from './order-item.model'
import { Order } from './order.model'

import type { OrderStatus } from './order.model'
import type { CartItem } from '../cart/cart-item.model'

export type OrderDto = Order

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order)
    private readonly orderModel: typeof Order,
    @InjectModel(OrderItem)
    private readonly orderItemModel: typeof OrderItem,
    private readonly cartService: CartService,
  ) {}

  async createPendingFromActiveCart(userId: number): Promise<Order> {
    const cart = await this.cartService.getActiveCartForUser(userId)

    if (cart === null || cart.items === undefined || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty')
    }

    const totalCents = cart.items.reduce((total, item) => total + this.getLineTotal(item), 0)
    const order = await this.orderModel.create({
      status: 'pending',
      stripeSessionId: null,
      totalCents,
      userId,
    })

    if (order.id === undefined) {
      throw new BadRequestException('Invalid order')
    }

    await this.orderItemModel.bulkCreate(
      cart.items.map((item) => {
        if (item.product === undefined) {
          throw new BadRequestException('Invalid cart item')
        }

        return {
          orderId: order.id as number,
          productId: item.productId,
          productName: item.product.designation,
          quantity: item.quantity,
          totalCents: this.getLineTotal(item),
          unitPriceCents: item.product.priceCents,
        }
      }),
    )

    await this.cartService.markOrdered(userId)

    return this.findForUser(userId, order.id)
  }

  async attachStripeSession(orderId: number, stripeSessionId: string): Promise<void> {
    const order = await this.orderModel.findByPk(orderId)

    if (order === null) {
      throw new NotFoundException('Order not found')
    }

    await order.update({ stripeSessionId })
  }

  async markPaidByStripeSession(stripeSessionId: string): Promise<Order> {
    const order = await this.orderModel.findOne({ where: { stripeSessionId } })

    if (order === null) {
      throw new NotFoundException('Order not found')
    }

    await this.updateStock(order)
    await order.update({ status: 'paid' })

    return this.findForUser(order.userId, order.id as number)
  }

  async findAllForUser(userId: number): Promise<Order[]> {
    return this.orderModel.findAll({
      include: [{ include: [Product], model: OrderItem }],
      order: [['createdAt', 'DESC']],
      where: { userId },
    })
  }

  async findForUser(userId: number, orderId: number): Promise<Order> {
    const order = await this.orderModel.findOne({
      include: [{ include: [Product], model: OrderItem }],
      where: { id: orderId, userId },
    })

    if (order === null) {
      throw new NotFoundException('Order not found')
    }

    return order
  }

  async updateStatus(userId: number, orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.findForUser(userId, orderId)
    await order.update({ status })

    return this.findForUser(userId, orderId)
  }

  private getLineTotal(item: CartItem): number {
    if (item.product === undefined) {
      throw new BadRequestException('Invalid cart item')
    }

    return item.quantity * item.product.priceCents
  }

  private async updateStock(order: Order): Promise<void> {
    const hydratedOrder = await this.findForUser(order.userId, order.id as number)

    for (const item of hydratedOrder.items ?? []) {
      if (item.product === undefined) {
        continue
      }

      await item.product.update({
        stock: Math.max(0, item.product.stock - item.quantity),
      })
    }
  }
}
