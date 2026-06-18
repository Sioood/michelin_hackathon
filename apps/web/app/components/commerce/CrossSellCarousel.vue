<script setup lang="ts">
import type { Product } from '~/types/product'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    productId?: number | null
    title?: string
  }>(),
  {
    compact: false,
    productId: null,
    title: 'Complétez votre équipement',
  },
)

const config = useRuntimeConfig()
const products = ref<Product[]>([])
const pending = ref(false)

async function loadCrossSell(productId: number) {
  pending.value = true

  try {
    products.value = await $fetch<Product[]>(`/products/${productId}/cross-sell`, {
      baseURL: config.public.apiBaseUrl,
    })
  } catch {
    products.value = []
  } finally {
    pending.value = false
  }
}

watch(
  () => props.productId,
  (productId) => {
    if (productId === null || productId === undefined || productId <= 0) {
      products.value = []
      return
    }

    void loadCrossSell(productId)
  },
  { immediate: true },
)
</script>

<template>
  <section v-if="pending || products.length > 0" class="grid gap-4">
    <div class="flex items-end justify-between gap-3">
      <div>
        <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Ventes croisées</p>
        <h2 :class="compact ? 'txt-h5' : 'txt-h3'" class="mt-1 font-black">{{ title }}</h2>
      </div>
    </div>

    <UIProgress v-if="pending" intent="primary" size="sm" label="Chargement des suggestions..." />

    <UICarousel
      v-else-if="products.length > 0"
      :slide-count="products.length"
      :slides-per-page="compact ? 1 : 1"
      spacing="1rem"
      intent="neutral"
      :show-autoplay-controls="false"
      loop
    >
      <UICarouselItem
        v-for="(product, index) in products"
        :key="product.slug"
        :index="index"
        class="w-full min-w-0"
      >
        <CatalogueProductCard :product="product" :compact="compact" class="w-full" />
      </UICarouselItem>
    </UICarousel>
  </section>
</template>
