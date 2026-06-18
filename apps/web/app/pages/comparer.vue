<script setup lang="ts">
import type { Product } from '~/types/product'

import { categoryLabels, getCategoryIntent } from '~/utils/catalogue'
import { formatPrice } from '~/utils/commerce'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const slugA = ref(typeof route.query.a === 'string' ? route.query.a : '')
const slugB = ref(typeof route.query.b === 'string' ? route.query.b : '')
const inputA = ref(slugA.value)
const inputB = ref(slugB.value)

const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')

async function compare() {
  const a = inputA.value.trim()
  const b = inputB.value.trim()

  if (!a || !b) {
    error.value = 'Veuillez renseigner les deux slugs de pneus à comparer.'
    return
  }

  if (a === b) {
    error.value = 'Veuillez choisir deux pneus différents.'
    return
  }

  error.value = ''
  loading.value = true

  await router.replace({ query: { a, b } })

  try {
    products.value = await $fetch<Product[]>('/products/compare', {
      baseURL: config.public.apiBaseUrl,
      query: { slugs: `${a},${b}` },
    })

    if (products.value.length < 2) {
      error.value = 'Un ou plusieurs pneus sont introuvables. Vérifiez les slugs.'
    }
  } catch {
    error.value = 'Impossible de charger les données de comparaison.'
  } finally {
    loading.value = false
  }
}

interface SpecRow {
  label: string
  key: keyof Product | string
  format?: (value: unknown) => string
}

const specRows: SpecRow[] = [
  { key: 'category', label: 'Catégorie', format: (v) => categoryLabels[v as keyof typeof categoryLabels] ?? String(v) },
  { key: 'designation', label: 'Désignation' },
  { key: 'priceCents', label: 'Prix', format: (v) => formatPrice(v as number) },
  { key: 'stock', label: 'Stock', format: (v) => `${v} unités` },
  { key: 'bead', label: 'Tringle' },
  { key: 'fitting', label: 'Montage' },
  { key: 'tpi', label: 'Carcasse (TPI)' },
  { key: 'weightG', label: 'Poids', format: (v) => (v ? `${v} g` : 'N/D') },
  {
    key: 'minPressureBar',
    label: 'Pression min.',
    format: (v) => (v !== null ? `${v} bar` : 'N/D'),
  },
  {
    key: 'maxPressureBar',
    label: 'Pression max.',
    format: (v) => (v !== null ? `${v} bar` : 'N/D'),
  },
  { key: 'tubelessReady', label: 'Tubeless Ready', format: (v) => (v ? 'Oui' : 'Non') },
  { key: 'eBikeReady', label: 'E-bike Ready', format: (v) => (v ? 'Oui' : 'Non') },
  { key: 'reflectiveStrip', label: 'Bande réfléchissante', format: (v) => (v ? 'Oui' : 'Non') },
]

function getCell(product: Product, row: SpecRow): string {
  const value = (product as Record<string, unknown>)[row.key]
  if (row.format) return row.format(value)
  return value != null && String(value).length > 0 ? String(value) : 'N/D'
}

function isHighlighted(row: SpecRow, indexA: number, indexB: number): boolean {
  const a = getCell(products.value[indexA]!, row)
  const b = getCell(products.value[indexB]!, row)
  return a !== b
}

onMounted(() => {
  if (slugA.value && slugB.value) {
    inputA.value = slugA.value
    inputB.value = slugB.value
    void compare()
  }
})

useHead({ title: 'Comparateur de pneus — Michelin' })
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <UIButton
        to="/"
        text="Retour au catalogue"
        intent="neutral"
        variant="ghost"
        leading-icon="tabler:arrow-left"
        class="mb-6"
      />

      <h1 class="txt-h1 font-black">Comparateur de pneus</h1>
      <p class="txt-lg mt-3 text-neutral-text-subtle">
        Comparez deux pneus Michelin côte à côte pour faire le meilleur choix.
      </p>

      <UICard class="mt-8" intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <div class="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
          <UIFormInput
            v-model="inputA"
            label="Pneu 1 (slug)"
            placeholder="ex : power-road-tubeless"
          />
          <UIFormInput
            v-model="inputB"
            label="Pneu 2 (slug)"
            placeholder="ex : wild-race-r-tubeless"
          />
          <div class="flex items-end">
            <UIButton
              text="Comparer"
              intent="primary"
              leading-icon="tabler:arrows-diff"
              :loading="loading"
              @click="compare"
            />
          </div>
        </div>

        <UIAlert
          v-if="error"
          class="mt-4"
          intent="error"
          :title="error"
        />
      </UICard>

      <UIProgress
        v-if="loading"
        class="mt-10"
        intent="primary"
        size="sm"
        label="Chargement de la comparaison..."
      />

      <div v-else-if="products.length >= 2" class="mt-10">
        <!-- En-têtes produits -->
        <div class="grid grid-cols-[200px_1fr_1fr] gap-4">
          <div />
          <UICard
            v-for="product in products"
            :key="product.slug"
            intent="primary"
            variant="subtle"
            :card-base-ui="{ body: 'rounded-md p-5 text-center' }"
          >
            <CatalogueProductTireVisual :category="product.category" class="mx-auto h-24 w-24" />
            <UIBadge
              :label="categoryLabels[product.category]"
              :intent="getCategoryIntent(product.category)"
              size="sm"
              class="mt-3"
            />
            <p class="txt-h4 mt-2 font-black">{{ product.rangeName }}</p>
            <p class="txt-caption text-neutral-text-subtle">{{ product.designation }}</p>
            <p class="txt-h3 mt-3 font-black text-primary-text-default">
              {{ formatPrice(product.priceCents, product.currency) }}
            </p>
            <UIButton
              class="mt-4 w-full"
              :to="`/products/${product.slug}`"
              text="Voir le produit"
              intent="primary"
              variant="outline"
              size="sm"
            />
          </UICard>
        </div>

        <!-- Tableau comparatif -->
        <div class="mt-6">
          <div
            v-for="row in specRows"
            :key="row.label"
            :class="[
              'grid grid-cols-[200px_1fr_1fr] gap-4 border-t border-neutral-border-subtle py-3',
              isHighlighted(row, 0, 1) ? 'bg-warning-surface-subtle' : '',
            ]"
          >
            <p class="txt-caption self-center font-bold text-neutral-text-subtle uppercase">
              {{ row.label }}
            </p>
            <p
              v-for="product in products"
              :key="product.slug"
              class="txt-label self-center font-bold"
            >
              {{ getCell(product, row) }}
            </p>
          </div>
        </div>

        <!-- Technologies -->
        <div class="mt-8 grid gap-6 sm:grid-cols-2">
          <UICard
            v-for="product in products"
            :key="product.slug"
            intent="neutral"
            variant="subtle"
            :card-base-ui="{ body: 'rounded-md p-5' }"
          >
            <h3 class="txt-h5 font-black">{{ product.rangeName }} — Technologies</h3>
            <div class="mt-3 flex flex-wrap gap-2">
              <UIChip
                v-for="tech in [
                  ...product.technologies,
                  ...product.rubberTechnologies,
                  ...product.casingTechnologies,
                  ...product.treadPatternTechnologies,
                  ...product.reinforcementTechnologies,
                ].filter((t, i, a) => t.length > 0 && a.indexOf(t) === i)"
                :key="tech"
                :label="tech"
                intent="primary"
                variant="subtle"
              />
            </div>
          </UICard>
        </div>
      </div>
    </section>
  </main>
</template>
