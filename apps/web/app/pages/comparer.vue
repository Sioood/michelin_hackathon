<script setup lang="ts">
import type { Product } from '~/types/product'

import { categoryLabels, getCategoryIntent } from '~/utils/catalogue'
import { formatPrice } from '~/utils/commerce'

const route = useRoute()
const router = useRouter()
const api = useApi()

const initialSlugA = typeof route.query.a === 'string' ? route.query.a : ''
const initialSlugB = typeof route.query.b === 'string' ? route.query.b : ''
const selectionA = ref<string[]>(initialSlugA ? [initialSlugA] : [])
const selectionB = ref<string[]>(initialSlugB ? [initialSlugB] : [])

const catalogue = ref<Product[]>([])
const products = ref<Product[]>([])
const catalogueLoading = ref(true)
const loading = ref(false)
const error = ref('')
const catalogueError = ref('')

const productItems = computed(() =>
  catalogue.value.map((product) => ({
    group: categoryLabels[product.category],
    label: `${product.rangeName} — ${product.designation}`,
    value: product.slug,
  })),
)

async function loadCatalogue() {
  catalogueLoading.value = true
  catalogueError.value = ''

  try {
    catalogue.value = await api.request<Product[]>('/products')
  } catch {
    catalogueError.value =
      'Impossible de charger le catalogue. Vérifiez que le service API est disponible.'
  } finally {
    catalogueLoading.value = false
  }
}

async function compare() {
  const [slugA] = selectionA.value
  const [slugB] = selectionB.value

  if (slugA === undefined || slugB === undefined) {
    error.value = 'Veuillez sélectionner deux pneus à comparer.'
    return
  }

  if (slugA === slugB) {
    error.value = 'Veuillez choisir deux pneus différents.'
    return
  }

  error.value = ''
  products.value = []
  loading.value = true

  await router.replace({ query: { a: slugA, b: slugB } })

  try {
    products.value = await api.request<Product[]>('/products/compare', {
      query: { slugs: `${slugA},${slugB}` },
    })
  } catch {
    error.value = 'Impossible de comparer ces références pour le moment.'
  } finally {
    loading.value = false
  }
}

interface SpecRow {
  format?: (value: unknown, product: Product) => string
  getValue: (product: Product) => unknown
  label: string
}

const specRows: SpecRow[] = [
  {
    format: (value) => categoryLabels[value as Product['category']],
    getValue: (product) => product.category,
    label: 'Catégorie',
  },
  { getValue: (product) => product.designation, label: 'Désignation' },
  {
    format: (value, product) => formatPrice(value as number, product.currency),
    getValue: (product) => product.priceCents,
    label: 'Prix',
  },
  {
    format: (value) => `${String(value)} unités`,
    getValue: (product) => product.stock,
    label: 'Stock',
  },
  { getValue: (product) => product.bead, label: 'Tringle' },
  { getValue: (product) => product.fitting, label: 'Montage' },
  { getValue: (product) => product.tpi, label: 'Carcasse (TPI)' },
  {
    format: (value) => (typeof value === 'number' ? `${value} g` : 'N/D'),
    getValue: (product) => product.weightG,
    label: 'Poids',
  },
  {
    format: formatPressure,
    getValue: (product) => product.minPressureBar,
    label: 'Pression min.',
  },
  {
    format: formatPressure,
    getValue: (product) => product.maxPressureBar,
    label: 'Pression max.',
  },
  {
    format: formatBoolean,
    getValue: (product) => product.tubelessReady,
    label: 'Tubeless Ready',
  },
  {
    format: formatBoolean,
    getValue: (product) => product.eBikeReady,
    label: 'E-bike Ready',
  },
  {
    format: formatBoolean,
    getValue: (product) => product.reflectiveStrip,
    label: 'Bande réfléchissante',
  },
  {
    getValue: (product) => product.proStats.victories,
    label: 'Victoires (données démo)',
  },
  {
    getValue: (product) => product.proStats.podiums,
    label: 'Podiums (données démo)',
  },
]

function getCell(product: Product, row: SpecRow): string {
  const value = row.getValue(product)

  if (row.format !== undefined) return row.format(value, product)
  return value !== null && value !== undefined && String(value).length > 0 ? String(value) : 'N/D'
}

function formatBoolean(value: unknown): string {
  return value === true ? 'Oui' : 'Non'
}

function formatPressure(value: unknown): string {
  return typeof value === 'number' ? `${value} bar` : 'N/D'
}

function isHighlighted(row: SpecRow): boolean {
  const [productA, productB] = products.value

  if (productA === undefined || productB === undefined) return false

  return getCell(productA, row) !== getCell(productB, row)
}

function getTechnologies(product: Product): string[] {
  return [
    ...product.technologies,
    ...product.rubberTechnologies,
    ...product.casingTechnologies,
    ...product.treadPatternTechnologies,
    ...product.reinforcementTechnologies,
    ...product.eBikeTechnologies,
  ].filter(
    (technology, index, technologies) =>
      technology.length > 0 && technologies.indexOf(technology) === index,
  )
}

onMounted(async () => {
  await loadCatalogue()

  if (initialSlugA && initialSlugB) {
    await compare()
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

      <UICard
        class="mt-8"
        intent="neutral"
        variant="default"
        :card-base-ui="{ body: 'rounded-md p-6' }"
      >
        <form class="grid gap-4 sm:grid-cols-[1fr_1fr_auto]" @submit.prevent="compare">
          <UIFormSelect
            v-model="selectionA"
            :items="productItems"
            :loading="catalogueLoading"
            label="Pneu 1"
            placeholder="Choisir une référence"
            :show-clear="false"
          />
          <UIFormSelect
            v-model="selectionB"
            :items="productItems"
            :loading="catalogueLoading"
            label="Pneu 2"
            placeholder="Choisir une référence"
            :show-clear="false"
          />
          <div class="flex items-end">
            <UIButton
              type="submit"
              text="Comparer"
              intent="primary"
              leading-icon="tabler:arrows-diff"
              :loading="loading"
              :disabled="catalogueLoading || catalogueError.length > 0"
            />
          </div>
        </form>

        <UIAlert
          v-if="catalogueError"
          class="mt-4"
          intent="error"
          title="Le catalogue est indisponible"
          :description="catalogueError"
        />
        <UIAlert v-else-if="error" class="mt-4" intent="error" :title="error" />
      </UICard>

      <UIProgress
        v-if="loading"
        class="mt-10"
        intent="primary"
        size="sm"
        label="Chargement de la comparaison..."
      />

      <div v-else-if="products.length >= 2" class="mt-10">
        <div class="overflow-x-auto pb-2">
          <div class="min-w-[760px]">
            <div class="grid grid-cols-[180px_1fr_1fr] gap-4">
              <div />
              <UICard
                v-for="product in products"
                :key="product.slug"
                intent="primary"
                variant="subtle"
                :card-base-ui="{ body: 'rounded-md p-5 text-center' }"
              >
                <CatalogueProductTireVisual
                  :category="product.category"
                  class="mx-auto h-24 w-24"
                />
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

            <div class="mt-6">
              <div
                v-for="row in specRows"
                :key="row.label"
                :class="[
                  'grid grid-cols-[180px_1fr_1fr] gap-4 border-t border-neutral-border-subtle px-2 py-3',
                  isHighlighted(row) ? 'bg-warning-surface-subtle' : '',
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
          </div>
        </div>

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
                v-for="tech in getTechnologies(product)"
                :key="tech"
                :label="tech"
                intent="primary"
                variant="subtle"
              />
              <p
                v-if="getTechnologies(product).length === 0"
                class="txt-base text-neutral-text-subtle"
              >
                Aucune technologie renseignée.
              </p>
            </div>
          </UICard>
        </div>
      </div>
    </section>
  </main>
</template>
