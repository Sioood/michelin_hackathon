<script setup lang="ts">
import type { Product } from '~/types/product'

import { categoryLabels, getCategoryIntent } from '~/utils/catalogue'

const route = useRoute()
const config = useRuntimeConfig()
const cart = useCartStore()

const slug = computed(() => String(route.params.slug))
const {
  data: product,
  error,
  pending,
} = await useFetch<Product>(() => `/products/${slug.value}`, {
  baseURL: config.public.apiBaseUrl,
  server: false,
})

const specRows = computed(() => {
  if (product.value === null) {
    return []
  }

  return [
    { label: 'Dimension', value: getProductDimension(product.value) },
    {
      label: 'ETRTO',
      value: [product.value.widthEtrto, product.value.diameterEtrto].filter(Boolean).join('-'),
    },
    { label: 'Tringle', value: product.value.bead },
    { label: 'Montage', value: product.value.fitting },
    { label: 'Carcasse', value: product.value.tpi },
    { label: 'Poids', value: product.value.weightG ? `${product.value.weightG} g` : null },
    { label: 'CAI', value: product.value.cai },
    { label: 'EAN', value: product.value.eanCode },
  ].filter((row) => row.value !== null && row.value !== '')
})

const pressureLabel = computed(() => {
  if (product.value?.minPressureBar === null || product.value?.maxPressureBar === null) {
    return 'Pression non communiquee'
  }

  return `${product.value.minPressureBar} - ${product.value.maxPressureBar} bar`
})

const psiLabel = computed(() => {
  if (product.value?.minPressurePsi === null || product.value?.maxPressurePsi === null) {
    return null
  }

  return `${product.value.minPressurePsi} - ${product.value.maxPressurePsi} psi`
})

const allTechnologies = computed(() => {
  if (product.value === null) {
    return []
  }

  return [
    ...product.value.technologies,
    ...product.value.rubberTechnologies,
    ...product.value.casingTechnologies,
    ...product.value.treadPatternTechnologies,
    ...product.value.reinforcementTechnologies,
    ...product.value.eBikeTechnologies,
  ].filter((technology, index, list) => technology.length > 0 && list.indexOf(technology) === index)
})

async function addToCart() {
  if (product.value?.id === undefined) {
    return
  }

  await cart.addItem(product.value.id)
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <UIButton
        to="/#catalogue"
        text="Retour au catalogue"
        intent="neutral"
        variant="ghost"
        leading-icon="tabler:arrow-left"
      />

      <UIProgress
        v-if="pending"
        class="mt-10"
        intent="primary"
        size="sm"
        label="Chargement de la fiche produit..."
      />

      <UIAlert
        v-else-if="error || product === null"
        class="mt-10"
        intent="error"
        title="Produit introuvable"
        description="La reference demandee n'existe pas dans le catalogue."
      />

      <div v-else class="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div>
          <CatalogueProductTireVisual :category="product.category" />

          <div class="mt-8 flex flex-wrap gap-2">
            <UIBadge
              :label="categoryLabels[product.category]"
              :intent="getCategoryIntent(product.category)"
              size="sm"
            />
            <UIChip v-if="product.tubelessReady" label="Tubeless Ready" intent="primary" />
            <UIChip v-if="product.eBikeReady" label="E-bike Ready" intent="success" />
            <UIChip
              v-if="product.reflectiveStrip"
              label="Bande reflechissante"
              intent="secondary"
            />
          </div>

          <h1 class="txt-h1 mt-5 font-black">{{ product.rangeName }}</h1>
          <p class="txt-lg mt-4 max-w-3xl text-neutral-text-subtle">{{ product.description }}</p>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <UICard
              v-for="stat in [
                { label: 'Victoires pro', value: product.proStats.victories },
                { label: 'Podiums', value: product.proStats.podiums },
                { label: 'Stock', value: product.stock },
              ]"
              :key="stat.label"
              intent="neutral"
              variant="subtle"
              :card-base-ui="{ body: 'rounded-md p-4' }"
            >
              <p class="txt-h4 font-black">{{ stat.value }}</p>
              <p class="txt-caption mt-1 text-neutral-text-subtle">{{ stat.label }}</p>
            </UICard>
          </div>

          <section class="mt-10">
            <h2 class="txt-h3 font-black">Technologies</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">{{ product.proStats.highlight }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <UIChip
                v-for="technology in allTechnologies"
                :key="technology"
                :label="technology"
                intent="primary"
                variant="subtle"
              />
            </div>
          </section>

          <ProductProStats :stats="product.proStats" />

          <ProductReviews v-if="product.id !== undefined" :product-id="product.id" />
        </div>

        <aside class="h-fit lg:sticky lg:top-24">
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ product.designation }}
            </p>
            <p class="txt-h2 mt-4 font-black">
              {{ formatPrice(product.priceCents, product.currency) }}
            </p>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              {{ product.stock > 0 ? `${product.stock} unites disponibles` : 'Rupture de stock' }}
            </p>

            <UIButton
              class="mt-6 w-full"
              text="Ajouter au panier"
              intent="primary"
              size="lg"
              leading-icon="tabler:shopping-cart-plus"
              :disabled="product.id === undefined || product.stock <= 0"
              @click="addToCart"
            />

            <div class="mt-6 border-t border-neutral-border-subtle pt-6">
              <h2 class="txt-h5 font-black">Pression recommandée</h2>
              <p class="txt-h4 mt-2 font-black text-primary-text-default">{{ pressureLabel }}</p>
              <p v-if="psiLabel" class="txt-caption mt-1 text-neutral-text-subtle">
                {{ psiLabel }}
              </p>
            </div>

            <dl class="mt-6 grid grid-cols-2 gap-3">
              <div
                v-for="row in specRows"
                :key="row.label"
                class="border-t border-neutral-border-subtle pt-3"
              >
                <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">
                  {{ row.label }}
                </dt>
                <dd class="txt-label mt-1 font-black">{{ row.value }}</dd>
              </div>
            </dl>
          </UICard>
        </aside>
      </div>
    </section>
  </main>
</template>
