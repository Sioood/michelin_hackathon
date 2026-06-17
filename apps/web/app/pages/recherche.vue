<script setup lang="ts">
import type { ProductCategory } from '~/types/product'
import type { AiSearchResponse, QuestionnaireAnswers, SearchTerrain } from '~/types/search'

import { categoryLabels, categoryOrder } from '~/utils/catalogue'

const route = useRoute()
const api = useApi()

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
  { label: 'IA', value: 'ai' },
  { label: 'Filtres', value: 'manual' },
]
const categoryOptions = categoryOrder.map((category) => ({
  label: categoryLabels[category],
  value: category,
}))
const terrainOptions: Array<{ label: string; value: SearchTerrain | 'all' }> = [
  { label: 'Tous terrains', value: 'all' },
  { label: 'Route', value: 'ROAD' },
  { label: 'Gravel', value: 'GRAVEL' },
  { label: 'VTT', value: 'MTB' },
  { label: 'Ville', value: 'CITY' },
  { label: 'Mixte', value: 'MIXED' },
]

const resultProducts = computed(() => response.value?.results ?? [])

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
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <UIBadge label="Recherche intelligente" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Trouver une référence Michelin</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            Décrivez votre vélo, votre terrain ou vos contraintes, puis ajustez avec les filtres.
          </p>
        </div>
        <UISegmentGroup v-model="mode" :options="modeOptions" intent="primary" size="sm" />
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
        <aside class="h-fit lg:sticky lg:top-24">
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <SearchAiSearchBar
              v-model="query"
              :pending="pending"
              :response="response"
              @search="searchAi"
            />

            <UIDivider class="my-6" />

            <div class="flex flex-col gap-4">
              <UIFormSelect
                v-model="manualCategory"
                label="Catégorie"
                :items="categoryOptions"
                :show-clear="false"
              />
              <UIFormSelect
                v-model="manualTerrain"
                label="Terrain"
                :items="terrainOptions"
                :show-clear="false"
              />
              <UIFormInput
                v-model="manualDiameter"
                label="Diamètre"
                placeholder="700, 29, 27.5..."
              />
              <UISwitch v-model="manualTubeless" label="Tubeless ready" />
              <UISwitch v-model="manualEbike" label="Compatible e-bike" />
              <UIButton
                type="button"
                text="Appliquer les filtres"
                intent="primary"
                leading-icon="tabler:adjustments-horizontal"
                :state="pending && mode === 'manual' ? 'loading' : 'default'"
                @click="searchManual"
              />
            </div>
          </UICard>
        </aside>

        <section>
          <UIAlert
            v-if="errorMessage"
            intent="error"
            title="Recherche impossible"
            :description="errorMessage"
          />
          <UIProgress v-else-if="pending" intent="primary" label="Recherche en cours..." />

          <div v-else-if="response === null" class="py-16 text-center">
            <Icon name="tabler:sparkles" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">Lancez une recherche</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              Exemple : pneu gravel tubeless pour vélo électrique en 700.
            </p>
          </div>

          <div v-else>
            <div class="flex items-end justify-between gap-4">
              <div>
                <p class="txt-brand text-primary-text-default">Résultats</p>
                <h2 class="txt-h2 mt-2 font-black">{{ resultProducts.length }} références</h2>
              </div>
              <p class="txt-caption text-neutral-text-subtle">
                Suggestions : {{ response.suggestedSlugs.join(', ') || 'aucune' }}
              </p>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div
                v-for="result in resultProducts"
                :key="result.product.slug"
                class="flex flex-col gap-2"
              >
                <CatalogueProductCard :product="result.product" />
                <div class="flex flex-wrap gap-2">
                  <UIChip
                    v-for="reason in result.matchReasons"
                    :key="reason"
                    :label="reason"
                    intent="info"
                    size="sm"
                    variant="subtle"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>
