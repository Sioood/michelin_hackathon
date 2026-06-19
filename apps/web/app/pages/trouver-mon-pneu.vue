<script setup lang="ts">
import type { Product, ProductCategory } from '~/types/product'
import type { AiSearchResponse, QuestionnaireAnswers, SearchTerrain } from '~/types/search'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

import { categoryLabels } from '~/utils/catalogue'
import { buildDiameterSelectItems } from '~/utils/questionnaire-options'

const config = useRuntimeConfig()
const api = useApi()

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
const sourcePresentation = computed(() =>
  response.value === null ? null : getSearchSourcePresentation(response.value.source),
)

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

const steps = ['Pratique', 'Montage', 'Priorité']
const categoryOptions: Array<{ label: string; value: ProductCategory }> = [
  { label: categoryLabels.road, value: 'road' },
  { label: categoryLabels.gravel, value: 'gravel' },
  { label: categoryLabels.mtb, value: 'mtb' },
  { label: categoryLabels['e-bike'], value: 'e-bike' },
  { label: categoryLabels['commuting-tour'], value: 'commuting-tour' },
]
const terrainOptions: Array<{ label: string; value: SearchTerrain }> = [
  { label: 'Route', value: 'ROAD' },
  { label: 'Gravel', value: 'GRAVEL' },
  { label: 'VTT', value: 'MTB' },
  { label: 'Ville', value: 'CITY' },
  { label: 'Mixte', value: 'MIXED' },
]
const priorityOptions: Array<{
  label: string
  value: NonNullable<QuestionnaireAnswers['priority']>
}> = [
  { label: 'Performance', value: 'performance' },
  { label: 'Confort', value: 'comfort' },
  { label: 'Durabilité', value: 'durability' },
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
        <UIBadge label="Assistant pneu" intent="secondary" size="sm" />
        <h1 class="txt-h1 mt-4 font-black">Trouver mon pneu</h1>
        <p class="txt-lg mt-3 text-neutral-text-subtle">
          Répondez à trois questions et obtenez une sélection compatible avec le catalogue.
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
                  label="Pratique principale"
                  :items="categoryOptions"
                  :show-clear="false"
                />
                <UIFormSelect
                  v-model="terrain"
                  label="Terrain dominant"
                  :items="terrainOptions"
                  :show-clear="false"
                />
              </div>
            </UIStepsContent>

            <UIStepsContent :index="1">
              <div class="mt-6 flex flex-col gap-5">
                <UIFormSelect
                  v-model="diameter"
                  label="Diamètre"
                  :items="diameterSelectItems"
                  :show-clear="false"
                  :disabled="diameterSelectItems.length === 0"
                />
                <UISwitch v-model="tubelessReady" label="Je veux du tubeless ready" />
                <UISwitch v-model="eBikeReady" label="Mon vélo est électrique" />
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
                  text="Voir mes recommandations"
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
              text="Retour"
              intent="neutral"
              variant="subtle"
              :disabled="step === 0"
              @click="step = Math.max(0, step - 1)"
            />
            <UIButton
              v-if="step < steps.length - 1"
              type="button"
              text="Continuer"
              intent="primary"
              @click="step = Math.min(steps.length - 1, step + 1)"
            />
          </div>
        </UICard>

        <section>
          <UIAlert
            v-if="errorMessage"
            intent="error"
            title="Assistant indisponible"
            :description="errorMessage"
          />
          <UIProgress
            v-else-if="pending"
            intent="primary"
            label="Préparation des recommandations..."
          />

          <div v-else-if="response === null" class="py-16 text-center">
            <Icon name="tabler:clipboard-list" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">Vos recommandations apparaîtront ici</h2>
          </div>

          <div v-else>
            <UIBadge
              v-if="sourcePresentation"
              :label="sourcePresentation.label"
              :intent="sourcePresentation.intent"
              :leading-icon="sourcePresentation.icon"
              size="sm"
              variant="subtle"
              class="mb-4"
            />
            <UIAlert
              :intent="sourcePresentation?.intent ?? 'neutral'"
              :title="sourcePresentation?.title ?? 'Pourquoi ces pneus ?'"
              :description="response.explanation"
              :icon="sourcePresentation?.icon"
            />

            <div
              v-if="response.results.length === 0"
              class="mt-6 rounded-md border border-neutral-border-subtle bg-neutral-surface-subtle p-8 text-center"
            >
              <Icon name="tabler:search-off" class="mx-auto size-10 text-neutral-text-subtle" />
              <h2 class="txt-h4 mt-4 font-black">Aucune référence exacte</h2>
              <p class="txt-base mt-2 text-neutral-text-subtle">
                Essayez d’élargir le diamètre ou de désactiver le tubeless pour voir plus de
                résultats.
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
