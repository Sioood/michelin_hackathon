<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    productId: number
    quantity?: number
  }>(),
  {
    quantity: 1,
  },
)

const cart = useCartStore()

async function reorder() {
  await cart.addItem(props.productId, props.quantity)
}
</script>

<template>
  <UIButton
    text="Racheter"
    intent="primary"
    size="sm"
    leading-icon="tabler:shopping-cart-plus"
    handle-loading-state
    @click="reorder"
  />
</template>
