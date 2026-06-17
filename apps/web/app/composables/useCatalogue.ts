import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

import {
  categoryLabels,
  categoryOrder,
  type CategoryFilter,
  type FeaturedRange,
  type Product,
} from '~/utils/catalogue'

export function useCatalogue(products: Ref<Product[]>) {
  const selectedCategory = ref<CategoryFilter>('all')
  const selectedUse = ref<string[]>(['all'])
  const selectedDiameter = ref<string[]>(['all'])
  const search = ref('')
  const resultLimit = ref(24)

  const useOptions = computed(() => {
    const values = new Set<string>()
    for (const product of products.value) {
      for (const useCase of product.useCases) {
        values.add(useCase)
      }
    }
    return [...values].sort((first, second) => first.localeCompare(second))
  })

  const diameterOptions = computed(() => {
    const values = new Set<string>()
    for (const product of products.value) {
      const diameter = product.webDiameterMm ?? product.webDiameterInch
      if (diameter) {
        values.add(diameter)
      }
    }
    return [...values].sort((first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
    )
  })

  const useSelectItems = computed<SelectItem[]>(() => [
    { label: 'Tous les usages', value: 'all' },
    ...useOptions.value.map((useCase) => ({ label: useCase, value: useCase })),
  ])

  const diameterSelectItems = computed<SelectItem[]>(() => [
    { label: 'Tous les diamètres', value: 'all' },
    ...diameterOptions.value.map((diameter) => ({ label: diameter, value: diameter })),
  ])

  const categoryStats = computed(() =>
    categoryOrder.map((category) => ({
      category,
      count:
        category === 'all'
          ? products.value.length
          : products.value.filter((product) => product.category === category).length,
      label: categoryLabels[category],
    })),
  )

  const filteredProducts = computed(() => {
    const query = search.value.trim().toLowerCase()
    const activeUse = selectedUse.value[0] ?? 'all'
    const activeDiameter = selectedDiameter.value[0] ?? 'all'

    return products.value.filter((product) => {
      const categoryMatches =
        selectedCategory.value === 'all' || product.category === selectedCategory.value
      const useMatches = activeUse === 'all' || product.useCases.includes(activeUse)
      const diameter = product.webDiameterMm ?? product.webDiameterInch
      const diameterMatches = activeDiameter === 'all' || diameter === activeDiameter
      const queryMatches =
        !query ||
        [
          product.rangeName,
          product.designation,
          product.segment,
          product.cai,
          product.eanCode,
          product.useCases.join(' '),
          product.technologies.join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)

      return categoryMatches && useMatches && diameterMatches && queryMatches
    })
  })

  const visibleProducts = computed(() => filteredProducts.value.slice(0, resultLimit.value))

  const featuredRanges = computed<FeaturedRange[]>(() => {
    const ranges = new Map<string, FeaturedRange>()

    for (const product of filteredProducts.value) {
      const existing = ranges.get(product.rangeName)
      if (existing) {
        existing.count += 1
        for (const technology of product.technologies.slice(0, 3)) {
          if (!existing.technologies.includes(technology)) {
            existing.technologies.push(technology)
          }
        }
        continue
      }

      ranges.set(product.rangeName, {
        category: product.category,
        count: 1,
        headline: product.headline,
        rangeName: product.rangeName,
        sample: product,
        technologies: product.technologies.slice(0, 3),
      })
    }

    return [...ranges.values()].slice(0, 6)
  })

  const heroStats = computed(() => [
    { label: 'Références catalogue', value: products.value.length.toString() },
    {
      label: 'Gammes web',
      value: new Set(products.value.map((product) => product.rangeName)).size.toString(),
    },
    {
      label: 'Univers vélo',
      value: categoryStats.value.filter((item) => item.count > 0).length.toString(),
    },
  ])

  function resetFilters() {
    selectedCategory.value = 'all'
    selectedUse.value = ['all']
    selectedDiameter.value = ['all']
    search.value = ''
    resultLimit.value = 24
  }

  function selectCategory(category: CategoryFilter) {
    selectedCategory.value = category
    resultLimit.value = 24
  }

  function loadMore() {
    resultLimit.value += 24
  }

  return {
    categoryStats,
    diameterSelectItems,
    featuredRanges,
    filteredProducts,
    heroStats,
    loadMore,
    resetFilters,
    resultLimit,
    search,
    selectCategory,
    selectedCategory,
    selectedDiameter,
    selectedUse,
    useSelectItems,
    visibleProducts,
  }
}
