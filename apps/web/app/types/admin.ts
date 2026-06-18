import type { OrderStatus } from './order'
import type { ProductCategory } from './product'

export interface AdminOrderStatusStat {
  status: OrderStatus
  count: number
}

export interface AdminRecentOrder {
  id: number
  currency: 'EUR'
  customer: string
  itemCount: number
  status: OrderStatus
  totalCents: number
  createdAt: string
}

export interface AdminLowStockProduct {
  id: number
  category: ProductCategory
  designation: string
  rangeName: string
  slug: string
  stock: number
}

export interface AdminOverview {
  orders: {
    paid: number
    pending: number
    shipped: number
    total: number
    totalRevenueCents: number
    byStatus: AdminOrderStatusStat[]
    recent: AdminRecentOrder[]
  }
  stocks: {
    lowStockCount: number
    outOfStockCount: number
    totalProducts: number
    totalUnits: number
    lowStock: AdminLowStockProduct[]
  }
}
