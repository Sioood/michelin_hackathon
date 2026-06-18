import type { Product } from './product'

export type OrderStatus = 'paid' | 'pending' | 'shipped'

export interface OrderItem {
  createdAt?: string
  id?: number
  orderId: number
  product?: Product
  productId: number
  productName: string
  quantity: number
  totalCents: number
  unitPriceCents: number
  updatedAt?: string
}

export interface Order {
  createdAt?: string
  currency: 'EUR'
  id?: number
  items?: OrderItem[]
  status: OrderStatus
  stripeSessionId: string | null
  totalCents: number
  updatedAt?: string
  userId: number
}

export interface CheckoutSession {
  orderId: number
  sessionId: string
  url: string
}
