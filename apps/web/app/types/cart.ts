import type { Product } from './product'

interface CartItem {
  id: number
  product: Product
  productId: number
  quantity: number
  subtotalCents: number
}

export interface Cart {
  currency: 'EUR'
  guestId: string | null
  id: number
  items: CartItem[]
  totalCents: number
  userId: number | null
}
