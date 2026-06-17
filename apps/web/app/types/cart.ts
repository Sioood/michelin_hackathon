import type { Product } from './product'

export interface CartItem {
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

export interface AddCartItemInput {
  productId: number
  quantity: number
}

export interface UpdateCartItemInput {
  quantity: number
}
