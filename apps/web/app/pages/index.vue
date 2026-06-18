<script setup lang="ts">
import type { Product } from '~/utils/catalogue'

const config = useRuntimeConfig()

const { data, pending, error } = await useFetch<Product[]>('/products', {
  baseURL: config.public.apiBaseUrl,
  default: () => [],
  server: false,
})

const products = computed(() => data.value ?? [])

const {
  categoryStats,
  diameterSelectItems,
  featuredRanges,
  filteredProducts,
  heroStats,
  loadMore,
  resetFilters,
  search,
  selectCategory,
  selectedCategory,
  selectedDiameter,
  selectedUse,
  useSelectItems,
  visibleProducts,
} = useCatalogue(products)

const useCount = computed(() => Math.max(0, useSelectItems.value.length - 1))
const diameterCount = computed(() => Math.max(0, diameterSelectItems.value.length - 1))
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <CatalogueHero :stats="heroStats" />

    <CatalogueCategoryNav
      :items="categoryStats"
      :selected-category="selectedCategory"
      @select="selectCategory"
    />

    <section
      id="catalogue"
      class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr]"
    >
      <aside class="h-fit lg:sticky lg:top-24">
        <CatalogueFilters
          v-model:search="search"
          v-model:selected-use="selectedUse"
          v-model:selected-diameter="selectedDiameter"
          :use-items="useSelectItems"
          :diameter-items="diameterSelectItems"
          :filtered-count="filteredProducts.length"
          @reset="resetFilters"
        />
      </aside>

      <div class="min-w-0">
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="txt-brand text-primary-text-default">{{ $t('catalogue.ranges.eyebrow') }}</p>
            <h2 class="txt-h2 mt-2 font-black">{{ $t('catalogue.ranges.title') }}</h2>
          </div>
          <UIProgress v-if="pending" intent="primary" size="sm" :label="$t('catalogue.loading')" />
          <UIAlert
            v-else-if="error"
            :title="$t('catalogue.apiError.title')"
            :description="$t('catalogue.apiError.description')"
            intent="error"
            icon="tabler:alert-circle"
          />
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CatalogueRangeCard
            v-for="range in featuredRanges"
            :key="range.rangeName"
            class="min-w-0"
            :range="range"
          />
        </div>

        <div class="mt-12 flex items-end justify-between gap-6">
          <div>
            <p class="txt-brand text-primary-text-default">
              {{ $t('catalogue.products.eyebrow') }}
            </p>
            <h2 class="txt-h2 mt-2 font-black">{{ $t('catalogue.products.title') }}</h2>
          </div>
          <p class="txt-base hidden text-neutral-text-subtle sm:block">
            {{
              $t('catalogue.products.count', {
                visible: visibleProducts.length,
                total: filteredProducts.length,
              })
            }}
          </p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CatalogueProductCard
            v-for="product in visibleProducts"
            :key="product.slug"
            class="min-w-0"
            :product="product"
          />
        </div>

        <div v-if="visibleProducts.length < filteredProducts.length" class="mt-8 text-center">
          <UIButton
            type="button"
            :text="$t('catalogue.products.loadMore')"
            intent="primary"
            size="lg"
            @click="loadMore"
          />
        </div>
      </div>
    </section>

    <CatalogueTechSection
      :diameter-count="diameterCount"
      :use-count="useCount"
      :pending="pending"
    />
  </main>
</template>
