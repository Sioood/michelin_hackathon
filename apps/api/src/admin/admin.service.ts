import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { OrderItem } from '../orders/order-item.model'
import { Order } from '../orders/order.model'
import { Product } from '../products/product.model'
import { User } from '../users/user.model'

import type { OrderStatus } from '../orders/order.model'
import type { ProductCategory } from '../products/product.model'

export interface AdminOrderStatusStatDto {
  status: OrderStatus
  count: number
}

export interface AdminRecentOrderDto {
  id: number
  currency: 'EUR'
  customer: string
  itemCount: number
  status: OrderStatus
  totalCents: number
  createdAt: Date
}

export interface AdminLowStockProductDto {
  id: number
  category: ProductCategory
  designation: string
  rangeName: string
  slug: string
  stock: number
}

export interface AdminOverviewDto {
  orders: {
    paid: number
    pending: number
    shipped: number
    total: number
    totalRevenueCents: number
    byStatus: AdminOrderStatusStatDto[]
    recent: AdminRecentOrderDto[]
  }
  stocks: {
    lowStockCount: number
    outOfStockCount: number
    totalProducts: number
    totalUnits: number
    lowStock: AdminLowStockProductDto[]
  }
}

const lowStockThreshold = 10
const orderStatuses: OrderStatus[] = ['pending', 'paid', 'shipped']

@Injectable()
export class AdminService {
  @InjectModel(Order)
  private readonly orderModel!: typeof Order

  @InjectModel(Product)
  private readonly productModel!: typeof Product

  async getOverview(): Promise<AdminOverviewDto> {
    const [totalOrders, statusCounts, totalRevenueCents, recentOrders, stockSummary] =
      await Promise.all([
        this.orderModel.count(),
        this.countOrdersByStatus(),
        this.sumPaidRevenue(),
        this.findRecentOrders(),
        this.getStockSummary(),
      ])

    return {
      orders: {
        byStatus: orderStatuses.map((status) => ({
          count: statusCounts[status],
          status,
        })),
        paid: statusCounts.paid,
        pending: statusCounts.pending,
        recent: recentOrders,
        shipped: statusCounts.shipped,
        total: totalOrders,
        totalRevenueCents,
      },
      stocks: stockSummary,
    }
  }

  private async countOrdersByStatus(): Promise<Record<OrderStatus, number>> {
    const counts = await Promise.all(
      orderStatuses.map(async (status) => ({
        count: await this.orderModel.count({ where: { status } }),
        status,
      })),
    )

    return counts.reduce<Record<OrderStatus, number>>(
      (accumulator, item) => ({
        ...accumulator,
        [item.status]: item.count,
      }),
      { paid: 0, pending: 0, shipped: 0 },
    )
  }

  private async sumPaidRevenue(): Promise<number> {
    const revenue = await this.orderModel.sum('totalCents', { where: { status: 'paid' } })

    return Number(revenue ?? 0)
  }

  private async findRecentOrders(): Promise<AdminRecentOrderDto[]> {
    const orders = await this.orderModel.findAll({
      include: [
        { attributes: ['email', 'firstName', 'lastName'], model: User },
        { attributes: ['quantity'], model: OrderItem },
      ],
      limit: 8,
      order: [['createdAt', 'DESC']],
    })

    return orders.map((order) => {
      const { user } = order
      const customer =
        [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'Client'

      return {
        createdAt: order.createdAt as Date,
        currency: order.currency,
        customer,
        id: order.id as number,
        itemCount: order.items?.reduce((total, item) => total + item.quantity, 0) ?? 0,
        status: order.status,
        totalCents: order.totalCents,
      }
    })
  }

  private async getStockSummary(): Promise<AdminOverviewDto['stocks']> {
    const [totalProducts, totalUnitsRaw, outOfStockCount, lowStockCount, lowStock] =
      await Promise.all([
        this.productModel.count(),
        this.productModel.sum('stock'),
        this.productModel.count({ where: { stock: 0 } }),
        this.productModel.count({ where: { stock: { [Op.lte]: lowStockThreshold } } }),
        this.productModel.findAll({
          limit: 10,
          order: [
            ['stock', 'ASC'],
            ['rangeName', 'ASC'],
          ],
          where: { stock: { [Op.lte]: lowStockThreshold } },
        }),
      ])

    return {
      lowStock: lowStock.map((product) => ({
        category: product.category,
        designation: product.designation,
        id: product.id as number,
        rangeName: product.rangeName,
        slug: product.slug,
        stock: product.stock,
      })),
      lowStockCount,
      outOfStockCount,
      totalProducts,
      totalUnits: Number(totalUnitsRaw ?? 0),
    }
  }
}
