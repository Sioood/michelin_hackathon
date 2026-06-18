<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'
import type { AiSearchResponse, QuestionnaireAnswers, SearchTerrain } from '~/types/search'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

import { categoryLabels } from '~/utils/catalogue'
import { buildDiameterSelectItems } from '~/utils/questionnaire-options'

const config = useRuntimeConfig()
const api = useApi()
const { t } = useI18n()

const { data: productsData } = await useFetch<Product[]>('/products', {
  baseURL: config.public.apiBaseUrl,
  default: () => [],
  server: false,
})

const products = computed(() => productsData.value ?? [])
const step = ref(0)
const pending = ref(false)
const errorMessage = ref('')
const response = ref<AiSearchResponse | null>(null)

const category = ref<ProductCategory[]>(['gravel'])
const terrain = ref<SearchTerrain[]>(['GRAVEL'])
const diameter = ref<string[]>(['700'])
const tubelessReady = ref(true)
const eBikeReady = ref(false)
const priority = ref<NonNullable<QuestionnaireAnswers['priority']>>('performance')

const diameterSelectItems = computed<SelectItem[]>(() =>
  buildDiameterSelectItems(products.value, category.value[0]),
)

watch(
  [category, diameterSelectItems],
  () => {
    const [current] = diameter.value
    if (diameterSelectItems.value.some((item) => item.value === current)) {
      return
    }

    diameter.value = [diameterSelectItems.value[0]?.value ?? '700']
  },
  { immediate: true },
)

const steps = computed(() => [
  t('search.assistant.steps.practice'),
  t('search.assistant.steps.setup'),
  t('search.assistant.steps.priority'),
])
const categoryOptions: Array<{ label: string; value: ProductCategory }> = [
  { label: t(categoryLabels.road), value: 'road' },
  { label: t(categoryLabels.gravel), value: 'gravel' },
  { label: t(categoryLabels.mtb), value: 'mtb' },
  { label: t(categoryLabels['e-bike']), value: 'e-bike' },
  { label: t(categoryLabels['commuting-tour']), value: 'commuting-tour' },
]
const terrainOptions: Array<{ label: string; value: SearchTerrain }> = [
  { label: t('search.terrain.road'), value: 'ROAD' },
  { label: t('search.terrain.gravel'), value: 'GRAVEL' },
  { label: t('search.terrain.mtb'), value: 'MTB' },
  { label: t('search.terrain.city'), value: 'CITY' },
  { label: t('search.terrain.mixed'), value: 'MIXED' },
]
const priorityOptions: Array<{
  label: string
  value: NonNullable<QuestionnaireAnswers['priority']>
}> = [
  { label: t('search.assistant.goals.performance'), value: 'performance' },
  { label: t('search.assistant.goals.comfort'), value: 'comfort' },
  { label: t('search.assistant.goals.durability'), value: 'durability' },
]

async function submit() {
  pending.value = true
  errorMessage.value = ''

  try {
    response.value = await api.request<AiSearchResponse>('/search/questionnaire', {
      body: {
        category: category.value[0] ?? 'gravel',
        diameter: diameter.value[0],
        eBikeReady: eBikeReady.value ? true : undefined,
        priority: priority.value,
        terrain: terrain.value[0] ?? 'GRAVEL',
        tubelessReady: tubelessReady.value ? true : undefined,
      },
      method: 'POST',
    })
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="max-w-3xl">
        <UIBadge :label="$t('search.assistant.badge')" intent="secondary" size="sm" />
        <h1 class="txt-h1 mt-4 font-black">{{ $t('search.assistant.title') }}</h1>
        <p class="txt-lg mt-3 text-neutral-text-subtle">
          {{ $t('search.assistant.description') }}
        </p>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <UICard
          class="w-full min-w-0"
          intent="neutral"
          variant="default"
          :card-base-ui="{
            root: 'flex w-full min-w-0 max-w-full flex-col',
            body: 'rounded-md p-6',
          }"
        >
          <UISteps
            v-model:step="step"
            class="w-full min-w-0"
            :items="steps"
            intent="primary"
            show-progress
            size="sm"
            :show-triggers="false"
          >
            <UIStepsContent :index="0">
              <div class="mt-6 flex flex-col gap-5">
                <UIFormSelect
                  v-model="category"
                  :label="$t('search.assistant.mainPractice')"
                  :items="categoryOptions"
                  :show-clear="false"
                />
                <UIFormSelect
                  v-model="terrain"
                  :label="$t('search.assistant.dominantTerrain')"
                  :items="terrainOptions"
                  :show-clear="false"
                />
              </div>
            </UIStepsContent>

            <UIStepsContent :index="1">
              <div class="mt-6 flex flex-col gap-5">
                <UIFormSelect
                  v-model="diameter"
                  :label="$t('search.assistant.diameter')"
                  :items="diameterSelectItems"
                  :show-clear="false"
                  :disabled="diameterSelectItems.length === 0"
                />
                <UISwitch v-model="tubelessReady" :label="$t('search.assistant.tubeless')" />
                <UISwitch v-model="eBikeReady" :label="$t('search.assistant.eBike')" />
              </div>
            </UIStepsContent>

            <UIStepsContent :index="2" class="w-full">
              <div class="mt-6 flex w-full flex-col gap-5">
                <UISegmentGroup
                  v-model="priority"
                  :options="priorityOptions"
                  intent="primary"
                  variant="pill"
                  class="w-full"
                  :ui="{ item: 'flex-1 justify-center', root: 'flex w-full' }"
                />
                <UIButton
                  type="button"
                  :text="$t('search.assistant.submit')"
                  intent="primary"
                  size="lg"
                  leading-icon="tabler:sparkles"
                  :state="pending ? 'loading' : 'default'"
                  @click="submit"
                />
              </div>
            </UIStepsContent>
          </UISteps>

          <div class="mt-6 flex justify-between gap-3">
            <UIButton
              type="button"
              :text="$t('common.back')"
              intent="neutral"
              variant="subtle"
              :disabled="step === 0"
              @click="step = Math.max(0, step - 1)"
            />
            <UIButton
              v-if="step < steps.length - 1"
              type="button"
              :text="$t('common.continue')"
              intent="primary"
              @click="step = Math.min(steps.length - 1, step + 1)"
            />
          </div>
        </UICard>

        <section>
          <UIAlert
            v-if="errorMessage"
            intent="error"
            :title="$t('search.assistant.errorTitle')"
            :description="errorMessage"
          />
          <UIProgress
            v-else-if="pending"
            intent="primary"
            :label="$t('search.assistant.loading')"
          />

          <div v-else-if="response === null" class="py-16 text-center">
            <Icon name="tabler:clipboard-list" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">{{ $t('search.assistant.emptyTitle') }}</h2>
          </div>

          <div v-else>
            <UIAlert
              intent="info"
              :title="$t('search.assistant.whyTitle')"
              :description="response.explanation"
            />

            <div
              v-if="response.results.length === 0"
              class="mt-6 rounded-md border border-neutral-border-subtle bg-neutral-surface-subtle p-8 text-center"
            >
              <Icon name="tabler:search-off" class="mx-auto size-10 text-neutral-text-subtle" />
              <h2 class="txt-h4 mt-4 font-black">{{ $t('search.assistant.noExactTitle') }}</h2>
              <p class="txt-base mt-2 text-neutral-text-subtle">
                {{ $t('search.assistant.noExactDescription') }}
              </p>
            </div>

            <div v-else class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <CatalogueProductCard
                v-for="result in response.results"
                :key="result.product.slug"
                :product="result.product"
                :tags="result.matchReasons"
              />
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
