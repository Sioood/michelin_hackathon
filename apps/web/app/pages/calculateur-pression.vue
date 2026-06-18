<script setup lang="ts">
import {
  calculatePressure,
  type BikeType,
  type PressureResult,
  type SurfaceType,
} from '~/utils/pressure-calculator'

const { t } = useI18n()
const riderWeight = ref('75')
const bikeWeight = ref('10')
const tireWidth = ref('28')
const bikeType = ref<BikeType>('road')
const surface = ref<SurfaceType>('asphalt')
const tubeless = ref(false)

const result = ref<PressureResult | null>(null)
const error = ref('')

const bikeTypeOptions = computed<Array<{ label: string; value: BikeType }>>(() => [
  { label: t('garage.bikeTypes.road'), value: 'road' },
  { label: t('garage.bikeTypes.gravel'), value: 'gravel' },
  { label: t('garage.bikeTypes.mtb'), value: 'mtb' },
  { label: t('garage.bikeTypes.eBike'), value: 'e-bike' },
  { label: t('garage.bikeTypes.city'), value: 'city' },
])

const surfaceOptions = computed<Array<{ label: string; value: SurfaceType }>>(() => [
  { label: t('pressure.surfaces.asphalt'), value: 'asphalt' },
  { label: t('pressure.surfaces.gravel'), value: 'gravel' },
  { label: t('pressure.surfaces.mixed'), value: 'mixed' },
  { label: t('pressure.surfaces.trail'), value: 'trail' },
])

const pressureNote = computed(() => result.value?.noteKeys.map((key) => t(key)).join(' ') ?? '')

function calculate() {
  error.value = ''

  const weight = Number(riderWeight.value)
  const bike = Number(bikeWeight.value)
  const width = Number(tireWidth.value)

  if (!Number.isFinite(weight) || weight < 30 || weight > 200) {
    error.value = t('pressure.invalidRiderWeight')
    return
  }

  if (!Number.isFinite(width) || width < 18 || width > 130) {
    error.value = t('pressure.invalidTireWidth')
    return
  }

  if (!Number.isFinite(bike) || bike < 5 || bike > 50) {
    error.value = t('pressure.invalidBikeWeight')
    return
  }

  try {
    result.value = calculatePressure({
      bikeType: bikeType.value,
      bikeWeightKg: bike,
      riderWeightKg: weight,
      surface: surface.value,
      tireWidthMm: width,
      tubeless: tubeless.value,
    })
  } catch (calculationError) {
    error.value =
      calculationError instanceof Error ? calculationError.message : t('pressure.impossible')
  }
}

function reset() {
  result.value = null
  error.value = ''
}

useHead({ title: t('pressure.headTitle') })
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <UIButton
        to="/"
        :text="$t('pressure.back')"
        intent="neutral"
        variant="ghost"
        leading-icon="tabler:arrow-left"
        class="mb-6"
      />

      <h1 class="txt-h1 font-black">{{ $t('pressure.title') }}</h1>
      <p class="txt-lg mt-3 text-neutral-text-subtle">
        {{ $t('pressure.description') }}
      </p>

      <UICard
        class="mt-8"
        intent="neutral"
        variant="default"
        :card-base-ui="{ body: 'rounded-md p-6' }"
      >
        <form class="space-y-6" @submit.prevent="calculate">
          <div class="grid gap-6 sm:grid-cols-2">
            <UIFormNumberInput
              v-model="riderWeight"
              :label="$t('pressure.riderWeight')"
              :min="30"
              :max="200"
              :step="1"
            />
            <UIFormNumberInput
              v-model="bikeWeight"
              :label="$t('pressure.bikeWeight')"
              :min="5"
              :max="50"
              :step="0.5"
            />
          </div>

          <UIFormNumberInput
            v-model="tireWidth"
            :label="$t('pressure.tireWidth')"
            :min="18"
            :max="130"
            :step="1"
            :helper-text="$t('pressure.tireWidthHelp')"
          />

          <div class="w-full min-w-0">
            <p class="txt-label mb-2 font-bold">{{ $t('pressure.bikeType') }}</p>
            <UISegmentGroup
              v-model="bikeType"
              :options="bikeTypeOptions"
              intent="primary"
              variant="pill"
              class="w-full"
              :ui="{ item: 'flex-1 justify-center', root: 'flex w-full' }"
            />
          </div>

          <div class="w-full min-w-0">
            <p class="txt-label mb-2 font-bold">{{ $t('pressure.surfaceType') }}</p>
            <UISegmentGroup
              v-model="surface"
              :options="surfaceOptions"
              intent="primary"
              variant="pill"
              class="w-full"
              :ui="{ item: 'flex-1 justify-center', root: 'flex w-full' }"
            />
          </div>

          <div class="flex items-center gap-3">
            <UISwitch v-model="tubeless" :label="$t('pressure.tubeless')" />
          </div>

          <UIAlert v-if="error" intent="error" :title="error" />

          <div class="flex gap-3">
            <UIButton
              type="submit"
              :text="$t('pressure.calculate')"
              intent="primary"
              size="lg"
              leading-icon="tabler:calculator"
            />
            <UIButton
              v-if="result !== null"
              type="button"
              :text="$t('pressure.reset')"
              intent="neutral"
              variant="ghost"
              size="lg"
              @click="reset"
            />
          </div>
        </form>
      </UICard>

      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="result !== null" class="mt-8">
          <h2 class="txt-h3 font-black">{{ $t('pressure.result') }}</h2>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-6' }">
              <p class="txt-caption font-bold text-primary-text-default uppercase">
                {{ $t('pressure.frontTyre') }}
              </p>
              <p class="txt-h1 mt-2 font-black text-primary-text-default">
                {{ result.frontBar }} bar
              </p>
              <p class="txt-base text-neutral-text-subtle">{{ result.frontPsi }} psi</p>
            </UICard>

            <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-6' }">
              <p class="txt-caption font-bold text-primary-text-default uppercase">
                {{ $t('pressure.rearTyre') }}
              </p>
              <p class="txt-h1 mt-2 font-black text-primary-text-default">
                {{ result.rearBar }} bar
              </p>
              <p class="txt-base text-neutral-text-subtle">{{ result.rearPsi }} psi</p>
            </UICard>
          </div>

          <UIAlert
            v-if="pressureNote"
            class="mt-4"
            intent="info"
            :title="$t('pressure.adviceTitle')"
            :description="pressureNote"
          />

          <p class="txt-caption mt-4 text-neutral-text-subtle">
            {{ $t('pressure.disclaimer') }}
          </p>
        </div>
      </Transition>
    </section>
  </main>
</template>
