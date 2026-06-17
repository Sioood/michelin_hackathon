import type { Cart } from '~/types/cart'

export const useCartStore = defineStore('cart', () => {
  const cart = ref<Cart | null>(null)
  const pending = ref(false)
  const errorMessage = ref('')
  const drawerOpen = ref(false)

  const itemCount = computed(
    () => cart.value?.items.reduce((total, item) => total + item.quantity, 0) ?? 0,
  )
  const totalCents = computed(() => cart.value?.totalCents ?? 0)
  const isEmpty = computed(() => itemCount.value === 0)

  async function load() {
    const api = useApi()
    pending.value = true
    errorMessage.value = ''

    try {
      cart.value = await api.request<Cart>('/cart')
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
    } finally {
      pending.value = false
    }
  }

  async function addItem(productId: number, quantity = 1) {
    const api = useApi()
    pending.value = true
    errorMessage.value = ''

    try {
      cart.value = await api.request<Cart>('/cart/items', {
        body: { productId, quantity },
        method: 'POST',
      })
      drawerOpen.value = true
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
      throw error
    } finally {
      pending.value = false
    }
  }

  async function updateItem(itemId: number, quantity: number) {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    const api = useApi()
    pending.value = true
    errorMessage.value = ''

    try {
      cart.value = await api.request<Cart>(`/cart/items/${itemId}`, {
        body: { quantity },
        method: 'PATCH',
      })
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
      throw error
    } finally {
      pending.value = false
    }
  }

  async function removeItem(itemId: number) {
    const api = useApi()
    pending.value = true
    errorMessage.value = ''

    try {
      cart.value = await api.request<Cart>(`/cart/items/${itemId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
      throw error
    } finally {
      pending.value = false
    }
  }

  function openDrawer() {
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  return {
    addItem,
    cart,
    closeDrawer,
    drawerOpen,
    errorMessage,
    isEmpty,
    itemCount,
    load,
    openDrawer,
    pending,
    removeItem,
    totalCents,
    updateItem,
  }
})
