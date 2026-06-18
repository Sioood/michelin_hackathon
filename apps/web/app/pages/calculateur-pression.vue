<script setup lang="ts">
import {
  calculatePressure,
  type BikeType,
  type PressureResult,
  type SurfaceType,
} from '~/utils/pressure-calculator'

const riderWeight = ref(75)
const bikeWeight = ref(10)
const tireWidth = ref(28)
const bikeType = ref<BikeType>('road')
const surface = ref<SurfaceType>('asphalt')
const tubeless = ref(false)

const result = ref<PressureResult | null>(null)
const error = ref('')

const bikeTypeOptions = [
  { label: 'Route', value: 'road' },
  { label: 'Gravel', value: 'gravel' },
  { label: 'VTT', value: 'mtb' },
  { label: 'E-bike', value: 'e-bike' },
  { label: 'Ville', value: 'city' },
]

const surfaceOptions = [
  { label: 'Asphalte', value: 'asphalt' },
  { label: 'Gravel', value: 'gravel' },
  { label: 'Mixte', value: 'mixed' },
  { label: 'Trail', value: 'trail' },
]

function calculate() {
  error.value = ''

  const weight = Number(riderWeight.value)
  const bike = Number(bikeWeight.value)
  const width = Number(tireWidth.value)

  if (!Number.isFinite(weight) || weight < 30 || weight > 200) {
    error.value = 'Poids cavalier invalide (30–200 kg).'
    return
  }

  if (!Number.isFinite(width) || width < 18 || width > 130) {
    error.value = 'Largeur de pneu invalide (18–130 mm).'
    return
  }

  result.value = calculatePressure({
    bikeType: bikeType.value,
    bikeWeightKg: Number.isFinite(bike) ? bike : 10,
    riderWeightKg: weight,
    surface: surface.value,
    tireWidthMm: width,
    tubeless: tubeless.value,
  })
}

function reset() {
  result.value = null
  error.value = ''
}

useHead({ title: 'Calculateur de pression pneus — Michelin' })
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <UIButton
        to="/"
        text="Retour au catalogue"
        intent="neutral"
        variant="ghost"
        leading-icon="tabler:arrow-left"
        class="mb-6"
      />

      <h1 class="txt-h1 font-black">Calculateur de pression pneus</h1>
      <p class="txt-lg mt-3 text-neutral-text-subtle">
        Obtenez une recommandation de pression avant et arrière adaptée à votre profil et à votre
        terrain.
      </p>

      <UICard class="mt-8" intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <div class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
            <UIFormNumberInput
              v-model="riderWeight"
              label="Poids cavalier (kg)"
              :min="30"
              :max="200"
              :step="1"
            />
            <UIFormNumberInput
              v-model="bikeWeight"
              label="Poids vélo (kg)"
              :min="5"
              :max="30"
              :step="0.5"
            />
          </div>

          <UIFormNumberInput
            v-model="tireWidth"
            label="Largeur de pneu (mm)"
            :min="18"
            :max="130"
            :step="1"
            helper-text="Ex : 25 mm route, 40 mm gravel, 57 mm VTT"
          />

          <div>
            <p class="txt-label mb-2 font-bold">Type de vélo</p>
            <UISegmentGroup
              v-model="bikeType"
              :options="bikeTypeOptions"
              intent="primary"
            />
          </div>

          <div>
            <p class="txt-label mb-2 font-bold">Type de surface</p>
            <UISegmentGroup
              v-model="surface"
              :options="surfaceOptions"
              intent="primary"
            />
          </div>

          <div class="flex items-center gap-3">
            <UISwitch v-model="tubeless" label="Pneu tubeless" />
          </div>

          <UIAlert
            v-if="error"
            intent="error"
            :title="error"
          />

          <div class="flex gap-3">
            <UIButton
              text="Calculer"
              intent="primary"
              size="lg"
              leading-icon="tabler:calculator"
              @click="calculate"
            />
            <UIButton
              v-if="result !== null"
              text="Réinitialiser"
              intent="neutral"
              variant="ghost"
              size="lg"
              @click="reset"
            />
          </div>
        </div>
      </UICard>

      <Transition
        enter-active-class="transition-all duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="result !== null" class="mt-8">
          <h2 class="txt-h3 font-black">Résultat</h2>

          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-6' }">
              <p class="txt-caption font-bold text-primary-text-default uppercase">
                Pneu avant
              </p>
              <p class="txt-h1 mt-2 font-black text-primary-text-default">
                {{ result.frontBar }} bar
              </p>
              <p class="txt-base text-neutral-text-subtle">{{ result.frontPsi }} psi</p>
            </UICard>

            <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-6' }">
              <p class="txt-caption font-bold text-primary-text-default uppercase">
                Pneu arrière
              </p>
              <p class="txt-h1 mt-2 font-black text-primary-text-default">
                {{ result.rearBar }} bar
              </p>
              <p class="txt-base text-neutral-text-subtle">{{ result.rearPsi }} psi</p>
            </UICard>
          </div>

          <UIAlert
            v-if="result.note"
            class="mt-4"
            intent="info"
            title="Conseil Michelin"
            :description="result.note"
          />

          <p class="txt-caption mt-4 text-neutral-text-subtle">
            Ces valeurs sont indicatives. Ajustez selon votre ressenti et vérifiez les préconisations
            du fabricant de votre pneu.
          </p>
        </div>
      </Transition>
    </section>
  </main>
</template>
