<script setup lang="ts">
type ProductCategory =
  | 'commuting-tour'
  | 'e-bike'
  | 'gravel'
  | 'inner-tubes'
  | 'kids'
  | 'mtb'
  | 'road'

interface Product {
  id?: number
  brand: string
  productType: string
  cycleTypeWeb: string
  category: ProductCategory
  segment: string | null
  rangeName: string
  slug: string
  cai: string
  eanCode: string | null
  designation: string
  webDiameterMm: string | null
  webDiameterInch: string | null
  webWidthMm: string | null
  webWidthInch: string | null
  rimType: string | null
  bead: string | null
  fitting: string | null
  tpi: string | null
  minPressureBar: number | null
  maxPressureBar: number | null
  minPressurePsi: number | null
  maxPressurePsi: number | null
  sidewallColor: string | null
  treadPatternColor: string | null
  labelType: string | null
  useCases: string[]
  terrainTypes: string[]
  technologies: string[]
  eBikeReady: boolean
  tubelessReady: boolean
  reflectiveStrip: boolean
  weightG: number | null
  headline: string
  description: string
  imageKey: string
}

const config = useRuntimeConfig()

const { data, pending, error } = await useFetch<Product[]>('/products', {
  baseURL: config.public.apiBaseUrl,
  default: () => [],
  server: false,
})

const selectedCategory = ref<ProductCategory | 'all'>('all')
const selectedUse = ref('all')
const selectedDiameter = ref('all')
const search = ref('')
const resultLimit = ref(24)

const categoryLabels: Record<ProductCategory | 'all', string> = {
  all: 'Tous les pneus',
  'commuting-tour': 'Ville & trekking',
  'e-bike': 'E-bike',
  gravel: 'Gravel',
  'inner-tubes': 'Chambres à air',
  kids: 'Junior',
  mtb: 'VTT',
  road: 'Route',
}

const categoryOrder: Array<ProductCategory | 'all'> = [
  'all',
  'road',
  'gravel',
  'mtb',
  'e-bike',
  'commuting-tour',
  'kids',
  'inner-tubes',
]

const products = computed(() => data.value ?? [])

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

  return products.value.filter((product) => {
    const categoryMatches =
      selectedCategory.value === 'all' || product.category === selectedCategory.value
    const useMatches = selectedUse.value === 'all' || product.useCases.includes(selectedUse.value)
    const diameter = product.webDiameterMm ?? product.webDiameterInch
    const diameterMatches = selectedDiameter.value === 'all' || diameter === selectedDiameter.value
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

const featuredRanges = computed(() => {
  const ranges = new Map<
    string,
    {
      category: ProductCategory
      count: number
      headline: string
      rangeName: string
      sample: Product
      technologies: string[]
    }
  >()

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
  selectedUse.value = 'all'
  selectedDiameter.value = 'all'
  search.value = ''
  resultLimit.value = 24
}

function selectCategory(category: ProductCategory | 'all') {
  selectedCategory.value = category
  resultLimit.value = 24
}

function loadMore() {
  resultLimit.value += 24
}
</script>

<template>
  <main class="min-h-svh bg-[#f7f7f4] text-[#121212]">
    <header class="sticky top-0 z-20 border-b border-white/10 bg-[#07142f] text-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="grid h-11 w-11 place-items-center bg-[#ffe500] font-black text-[#07142f]">
            M
          </div>
          <div>
            <p class="text-sm font-black tracking-[0.22em] uppercase">Michelin</p>
            <p class="text-xs text-white/70">Bicycle catalogue 2026</p>
          </div>
        </div>
        <nav class="hidden items-center gap-7 text-sm font-semibold text-white/80 md:flex">
          <a href="#categories" class="hover:text-white">Pneus vélo</a>
          <a href="#catalogue" class="hover:text-white">Catalogue</a>
          <a href="#technologies" class="hover:text-white">Technologies</a>
        </nav>
      </div>
    </header>

    <section class="relative overflow-hidden bg-[#07142f] text-white">
      <img
        src="/images/bicycle-hero.png"
        alt=""
        class="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(90deg,#07142f_0%,rgba(7,20,47,0.92)_34%,rgba(7,20,47,0.34)_100%)]"
      />
      <div
        class="relative mx-auto grid min-h-[620px] max-w-7xl content-end px-4 py-10 sm:px-6 lg:grid-cols-[0.96fr_1fr] lg:py-16"
      >
        <div class="pb-10">
          <p
            class="mb-4 inline-flex bg-[#ffe500] px-3 py-1 text-xs font-black tracking-[0.18em] text-[#07142f] uppercase"
          >
            Vélo route, gravel, VTT, ville et e-bike
          </p>
          <h1
            class="max-w-3xl text-5xl leading-[0.96] font-black tracking-normal sm:text-6xl lg:text-7xl"
          >
            Trouvez le pneu vélo adapté à votre pratique
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-white/84">
            Une expérience catalogue inspirée du site Michelin Bicycle, enrichie avec les références
            du fichier produit 2026.
          </p>
          <div
            class="mt-8 grid max-w-2xl grid-cols-3 border border-white/18 bg-white/10 backdrop-blur"
          >
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              class="border-r border-white/14 p-4 last:border-r-0"
            >
              <p class="text-3xl font-black text-[#ffe500]">{{ stat.value }}</p>
              <p class="mt-1 text-xs font-semibold text-white/72 uppercase">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="categories" class="border-b border-[#d9d9d2] bg-white">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="item in categoryStats"
            :key="item.category"
            type="button"
            class="shrink-0 border px-4 py-3 text-left transition"
            :class="
              selectedCategory === item.category
                ? 'border-[#07142f] bg-[#07142f] text-white'
                : 'border-[#d9d9d2] bg-white text-[#07142f] hover:border-[#07142f]'
            "
            @click="selectCategory(item.category)"
          >
            <span class="block text-sm font-black">{{ item.label }}</span>
            <span class="text-xs opacity-70">{{ item.count }} références</span>
          </button>
        </div>
      </div>
    </section>

    <section
      id="catalogue"
      class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[320px_1fr]"
    >
      <aside class="h-fit border border-[#d9d9d2] bg-white p-5 lg:sticky lg:top-24">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-black">Recherche</h2>
          <button type="button" class="text-sm font-bold text-[#244f9e]" @click="resetFilters">
            Réinitialiser
          </button>
        </div>

        <label class="mt-5 block">
          <span class="text-xs font-black tracking-[0.14em] text-[#5d625c] uppercase">Mot clé</span>
          <input
            v-model="search"
            type="search"
            placeholder="Power Cup, gravel, 700..."
            class="mt-2 w-full border border-[#c9c9c0] px-3 py-3 text-sm outline-none focus:border-[#07142f]"
          />
        </label>

        <label class="mt-4 block">
          <span class="text-xs font-black tracking-[0.14em] text-[#5d625c] uppercase">Usage</span>
          <select
            v-model="selectedUse"
            class="mt-2 w-full border border-[#c9c9c0] bg-white px-3 py-3 text-sm outline-none focus:border-[#07142f]"
          >
            <option value="all">Tous les usages</option>
            <option v-for="useCase in useOptions" :key="useCase" :value="useCase">
              {{ useCase }}
            </option>
          </select>
        </label>

        <label class="mt-4 block">
          <span class="text-xs font-black tracking-[0.14em] text-[#5d625c] uppercase"
            >Diamètre</span
          >
          <select
            v-model="selectedDiameter"
            class="mt-2 w-full border border-[#c9c9c0] bg-white px-3 py-3 text-sm outline-none focus:border-[#07142f]"
          >
            <option value="all">Tous les diamètres</option>
            <option v-for="diameter in diameterOptions" :key="diameter" :value="diameter">
              {{ diameter }}
            </option>
          </select>
        </label>

        <div class="mt-6 border-t border-[#e5e5df] pt-5">
          <p class="text-4xl font-black">{{ filteredProducts.length }}</p>
          <p class="text-sm text-[#666]">références correspondent aux filtres actifs</p>
        </div>
      </aside>

      <div>
        <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p class="font-black tracking-[0.18em] text-[#244f9e] uppercase">
              Gammes mises en avant
            </p>
            <h2 class="mt-2 text-3xl font-black sm:text-4xl">Explorer par famille de pneus</h2>
          </div>
          <p v-if="pending" class="text-sm font-semibold text-[#666]">Chargement du catalogue...</p>
          <p v-else-if="error" class="text-sm font-semibold text-[#b42318]">
            API indisponible. Vérifie que `pnpm dev` est lancé.
          </p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="range in featuredRanges"
            :key="range.rangeName"
            class="group border border-[#d9d9d2] bg-white p-5 transition hover:-translate-y-1 hover:border-[#07142f] hover:shadow-xl"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs font-black tracking-[0.14em] text-[#244f9e] uppercase">
                  {{ categoryLabels[range.category] }}
                </p>
                <h3 class="mt-2 text-xl font-black">{{ range.rangeName }}</h3>
              </div>
              <div class="tire-mark" :data-category="range.category" aria-hidden="true" />
            </div>
            <p class="mt-4 text-sm leading-6 text-[#555]">{{ range.headline }}</p>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="technology in range.technologies"
                :key="technology"
                class="bg-[#f2f2ec] px-2 py-1 text-xs font-bold text-[#333]"
              >
                {{ technology }}
              </span>
            </div>
            <p class="mt-5 text-sm font-black">{{ range.count }} variantes disponibles</p>
          </article>
        </div>

        <div class="mt-12 flex items-end justify-between gap-6">
          <div>
            <p class="font-black tracking-[0.18em] text-[#244f9e] uppercase">Produits</p>
            <h2 class="mt-2 text-3xl font-black sm:text-4xl">Catalogue détaillé</h2>
          </div>
          <p class="hidden text-sm text-[#666] sm:block">
            {{ visibleProducts.length }} affichés sur {{ filteredProducts.length }}
          </p>
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <article
            v-for="product in visibleProducts"
            :key="product.slug"
            class="flex min-h-[430px] flex-col border border-[#d9d9d2] bg-white"
          >
            <div
              class="product-visual grid min-h-44 place-items-center"
              :data-category="product.category"
            >
              <div class="tire-visual" aria-hidden="true">
                <span />
              </div>
            </div>
            <div class="flex flex-1 flex-col p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-black tracking-[0.14em] text-[#244f9e] uppercase">
                    {{ categoryLabels[product.category] }}
                  </p>
                  <h3 class="mt-2 text-lg leading-6 font-black">{{ product.rangeName }}</h3>
                </div>
                <span class="bg-[#ffe500] px-2 py-1 text-xs font-black text-[#07142f]">
                  {{ product.productType }}
                </span>
              </div>

              <p class="mt-3 line-clamp-2 text-sm leading-6 text-[#555]">
                {{ product.designation }}
              </p>

              <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div class="border-t border-[#e5e5df] pt-3">
                  <dt class="text-xs font-bold text-[#777] uppercase">Dimension</dt>
                  <dd class="mt-1 font-black">
                    {{ product.webDiameterMm ?? product.webDiameterInch ?? 'N/A' }}
                    <span v-if="product.webWidthMm">x {{ product.webWidthMm }}</span>
                  </dd>
                </div>
                <div class="border-t border-[#e5e5df] pt-3">
                  <dt class="text-xs font-bold text-[#777] uppercase">Poids</dt>
                  <dd class="mt-1 font-black">
                    {{ product.weightG ? `${product.weightG} g` : 'N/A' }}
                  </dd>
                </div>
                <div class="border-t border-[#e5e5df] pt-3">
                  <dt class="text-xs font-bold text-[#777] uppercase">Pression</dt>
                  <dd class="mt-1 font-black">
                    <template v-if="product.minPressureBar && product.maxPressureBar">
                      {{ product.minPressureBar }}-{{ product.maxPressureBar }} bar
                    </template>
                    <template v-else>N/A</template>
                  </dd>
                </div>
                <div class="border-t border-[#e5e5df] pt-3">
                  <dt class="text-xs font-bold text-[#777] uppercase">CAI</dt>
                  <dd class="mt-1 font-black">{{ product.cai }}</dd>
                </div>
              </dl>

              <div class="mt-5 flex flex-wrap gap-2">
                <span
                  v-if="product.tubelessReady"
                  class="border border-[#07142f] px-2 py-1 text-xs font-bold"
                >
                  Tubeless
                </span>
                <span
                  v-if="product.eBikeReady"
                  class="border border-[#07142f] px-2 py-1 text-xs font-bold"
                >
                  E-bike
                </span>
                <span
                  v-if="product.reflectiveStrip"
                  class="border border-[#07142f] px-2 py-1 text-xs font-bold"
                >
                  Réfléchissant
                </span>
              </div>

              <div class="mt-auto pt-5">
                <p class="text-xs font-bold text-[#666]">
                  {{ product.technologies.slice(0, 3).join(' · ') }}
                </p>
              </div>
            </div>
          </article>
        </div>

        <div v-if="visibleProducts.length < filteredProducts.length" class="mt-8 text-center">
          <button
            type="button"
            class="bg-[#07142f] px-6 py-4 text-sm font-black text-white transition hover:bg-[#244f9e]"
            @click="loadMore"
          >
            Afficher plus de références
          </button>
        </div>
      </div>
    </section>

    <section id="technologies" class="bg-[#07142f] py-14 text-white">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p class="font-black tracking-[0.18em] text-[#ffe500] uppercase">Technologies</p>
          <h2 class="mt-2 text-4xl font-black">Des filtres pensés pour choisir vite</h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="border border-white/16 p-5">
            <p class="text-2xl font-black">{{ useOptions.length }}</p>
            <p class="mt-1 text-sm text-white/70">usages issus du catalogue</p>
          </div>
          <div class="border border-white/16 p-5">
            <p class="text-2xl font-black">{{ diameterOptions.length }}</p>
            <p class="mt-1 text-sm text-white/70">diamètres disponibles</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.tire-mark {
  border: 8px solid #07142f;
  border-radius: 999px;
  height: 54px;
  position: relative;
  width: 54px;
}

.tire-mark::after {
  background: #ffe500;
  border-radius: 999px;
  content: '';
  inset: 12px;
  position: absolute;
}

.product-visual {
  background:
    radial-gradient(circle at 70% 20%, rgb(255 229 0 / 0.42), transparent 22%),
    linear-gradient(135deg, #eef1f4 0%, #ffffff 54%, #d8dee8 100%);
}

.product-visual[data-category='road'] {
  background:
    radial-gradient(circle at 75% 20%, rgb(255 229 0 / 0.48), transparent 22%),
    linear-gradient(135deg, #f5f7f9 0%, #ffffff 55%, #d9e6f8 100%);
}

.product-visual[data-category='mtb'] {
  background:
    radial-gradient(circle at 75% 20%, rgb(255 229 0 / 0.42), transparent 22%),
    linear-gradient(135deg, #eef4ed 0%, #ffffff 50%, #cedbc9 100%);
}

.product-visual[data-category='gravel'] {
  background:
    radial-gradient(circle at 75% 20%, rgb(255 229 0 / 0.42), transparent 22%),
    linear-gradient(135deg, #f3f0ea 0%, #ffffff 50%, #dccfb9 100%);
}

.tire-visual {
  align-items: center;
  border: 22px solid #101820;
  border-radius: 999px;
  box-shadow:
    inset 0 0 0 5px #2d3338,
    0 18px 40px rgb(7 20 47 / 0.22);
  display: flex;
  height: 134px;
  justify-content: center;
  position: relative;
  width: 134px;
}

.tire-visual::before,
.tire-visual::after {
  background: repeating-linear-gradient(90deg, #2b3137 0 6px, #111820 6px 12px);
  content: '';
  height: 16px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 142px;
}

.tire-visual::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.tire-visual span {
  background: #f7f7f4;
  border: 3px solid #cfd5dc;
  border-radius: 999px;
  height: 56px;
  position: relative;
  width: 56px;
  z-index: 1;
}
</style>
