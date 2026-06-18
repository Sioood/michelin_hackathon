<script setup lang="ts">
import type { ProductCategory } from '~/types/product'
import type { AiSearchResponse, QuestionnaireAnswers, SearchTerrain } from '~/types/search'

import { categoryLabels, categoryOrder } from '~/utils/catalogue'

const route = useRoute()
const api = useApi()
const { t } = useI18n()

const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
const mode = ref('ai')
const response = ref<AiSearchResponse | null>(null)
const pending = ref(false)
const errorMessage = ref('')

const manualCategory = ref<Array<ProductCategory | 'all'>>(['all'])
const manualTerrain = ref<Array<SearchTerrain | 'all'>>(['all'])
const manualDiameter = ref('')
const manualTubeless = ref(false)
const manualEbike = ref(false)

const modeOptions = [
  { label: t('search.mode.ai'), value: 'ai' },
  { label: t('search.mode.manual'), value: 'manual' },
]
const categoryOptions = categoryOrder.map((category) => ({
  label: t(categoryLabels[category]),
  value: category,
}))
const terrainOptions: Array<{ label: string; value: SearchTerrain | 'all' }> = [
  { label: t('search.terrain.all'), value: 'all' },
  { label: t('search.terrain.road'), value: 'ROAD' },
  { label: t('search.terrain.gravel'), value: 'GRAVEL' },
  { label: t('search.terrain.mtb'), value: 'MTB' },
  { label: t('search.terrain.city'), value: 'CITY' },
  { label: t('search.terrain.mixed'), value: 'MIXED' },
]

const resultProducts = computed(() => response.value?.results ?? [])
const suggestionCount = computed(() => response.value?.suggestedSlugs.length ?? 0)

async function searchAi(value = query.value) {
  const normalized = value.trim()
  if (normalized.length < 3) return

  pending.value = true
  errorMessage.value = ''
  mode.value = 'ai'

  try {
    response.value = await api.request<AiSearchResponse>('/search/ai', {
      body: { query: normalized },
      method: 'POST',
    })
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  } finally {
    pending.value = false
  }
}

async function searchManual() {
  pending.value = true
  errorMessage.value = ''
  mode.value = 'manual'

  const answers: QuestionnaireAnswers = {
    diameter: manualDiameter.value.trim() || undefined,
    eBikeReady: manualEbike.value || undefined,
    tubelessReady: manualTubeless.value || undefined,
  }

  const selectedCategory = manualCategory.value[0] ?? 'all'
  const selectedTerrain = manualTerrain.value[0] ?? 'all'

  if (selectedCategory !== 'all') {
    answers.category = selectedCategory
  }

  if (selectedTerrain !== 'all') {
    answers.terrain = selectedTerrain
  }

  try {
    response.value = await api.request<AiSearchResponse>('/search/questionnaire', {
      body: answers,
      method: 'POST',
    })
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  if (query.value.trim().length >= 3) {
    void searchAi()
  }
})
</script>

<template>
  <main class="min-h-svh overflow-x-hidden bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div class="min-w-0">
          <UIBadge :label="$t('search.page.badge')" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">{{ $t('search.page.title') }}</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            {{ $t('search.page.description') }}
          </p>
        </div>
        <UISegmentGroup
          v-model="mode"
          :options="modeOptions"
          intent="primary"
          size="sm"
          class="shrink-0"
        />
      </div>

      <div class="mt-8 flex flex-col gap-8 lg:flex-row lg:items-start">
        <aside class="w-full shrink-0 lg:sticky lg:top-24 lg:w-80">
          <div
            class="rounded-md border border-neutral-border-subtle bg-neutral-surface-default p-5"
          >
            <SearchAiSearchBar
              v-model="query"
              stacked
              :pending="pending"
              :response="response"
              @search="searchAi"
            />

            <UIDivider class="my-6" />

            <div class="flex flex-col gap-4">
              <UIFormSelect
                v-model="manualCategory"
                :label="$t('search.page.category')"
                :items="categoryOptions"
                :show-clear="false"
              />
              <UIFormSelect
                v-model="manualTerrain"
                :label="$t('search.page.terrain')"
                :items="terrainOptions"
                :show-clear="false"
              />
              <UIFormInput
                v-model="manualDiameter"
                :label="$t('search.page.diameter')"
                placeholder="700, 29, 27.5..."
              />
              <UISwitch v-model="manualTubeless" :label="$t('search.page.tubeless')" />
              <UISwitch v-model="manualEbike" :label="$t('search.page.eBike')" />
              <UIButton
                type="button"
                :text="$t('search.page.apply')"
                intent="primary"
                leading-icon="tabler:adjustments-horizontal"
                :state="pending && mode === 'manual' ? 'loading' : 'default'"
                class="whitespace-nowrap"
                @click="searchManual"
              />
            </div>
          </div>
        </aside>

        <div class="min-w-0 flex-1 overflow-hidden">
          <UIAlert
            v-if="errorMessage"
            intent="error"
            :title="$t('search.page.errorTitle')"
            :description="errorMessage"
          />
          <UIProgress v-else-if="pending" intent="primary" :label="$t('search.page.loading')" />

          <div v-else-if="response === null" class="py-16 text-center">
            <Icon name="tabler:sparkles" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">{{ $t('search.page.launchTitle') }}</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              {{ $t('search.page.launchExample') }}
            </p>
          </div>

          <div v-else class="min-w-0">
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div class="min-w-0">
                <p class="txt-brand text-primary-text-default">
                  {{ $t('search.page.resultEyebrow') }}
                </p>
                <h2 class="txt-h2 mt-2 font-black">
                  {{ $t('search.page.resultCount', { count: resultProducts.length }) }}
                </h2>
              </div>
              <UIBadge
                v-if="suggestionCount > 0"
                :label="$t('search.page.suggestions', { count: suggestionCount })"
                intent="info"
                size="sm"
                variant="subtle"
                class="shrink-0"
              />
            </div>

            <div class="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <CatalogueProductCard
                v-for="result in resultProducts"
                :key="result.product.slug"
                class="w-full min-w-0"
                :product="result.product"
                :tags="result.matchReasons"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
