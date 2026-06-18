<script setup lang="ts">
import type { Bike, BikeType, CreateBikeInput, GarageReminderSeverity } from '~/types/garage'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

const auth = useAuthStore()
const garage = useGarage()
const route = useRoute()

const name = ref('')
const brand = ref('')
const model = ref('')
const annualDistanceKm = ref('2500')
const selectedType = ref<string[]>(['road'])
const createError = ref('')

const bikeTypes: Array<{ label: string; value: BikeType }> = [
  { label: 'Route', value: 'road' },
  { label: 'Gravel', value: 'gravel' },
  { label: 'VTT', value: 'mtb' },
  { label: 'E-bike', value: 'e-bike' },
  { label: 'Ville', value: 'city' },
]

const diameterItems: SelectItem[] = [
  { label: '700c — route / gravel', value: '700' },
  { label: '650b / 27,5" — gravel / VTT', value: '27.5' },
  { label: '29" — VTT', value: '29' },
  { label: '28" — ville / trekking', value: '28' },
  { label: '26" — VTT ancien', value: '26' },
]

const selectedDiameter = ref<string[]>(['700'])

const typeItems = computed<SelectItem[]>(() => bikeTypes)

const checkoutOrderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? value : null
})

function typeLabel(type: BikeType): string {
  return bikeTypes.find((item) => item.value === type)?.label ?? type
}

function reminderIntent(severity: GarageReminderSeverity) {
  switch (severity) {
    case 'due':
      return 'error'
    case 'soon':
      return 'warning'
    case 'ok':
      return 'success'
  }
}

function primaryReminder(bike: Bike) {
  return (
    bike.reminders.find((reminder) => reminder.severity === 'due') ??
    bike.reminders.find((reminder) => reminder.severity === 'soon') ??
    bike.reminders[0] ??
    null
  )
}

async function createBike() {
  createError.value = ''
  const trimmedName = name.value.trim()
  const type = selectedType.value[0] as BikeType | undefined
  const distance = Number(annualDistanceKm.value)

  if (!trimmedName || type === undefined) {
    createError.value = 'Nom et type de vélo sont requis.'
    return
  }

  const input: CreateBikeInput = {
    annualDistanceKm: Number.isFinite(distance) ? distance : 2500,
    brand: brand.value.trim() || undefined,
    model: model.value.trim() || undefined,
    name: trimmedName,
    type,
    wheelDiameter: selectedDiameter.value[0] || undefined,
  }

  const bike = await garage.createBike(input)
  name.value = ''
  brand.value = ''
  model.value = ''
  selectedDiameter.value = ['700']
  annualDistanceKm.value = '2500'
  await navigateTo(
    `/garage/${bike.id}${checkoutOrderId.value ? `?orderId=${checkoutOrderId.value}` : ''}`,
  )
}

async function deleteBike(bikeId: number, event: Event) {
  event.preventDefault()
  event.stopPropagation()

  if (!globalThis.confirm('Supprimer ce vélo du garage ?')) {
    return
  }

  await garage.removeBike(bikeId)
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  await garage.loadBikes()
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <UIBadge label="Garage virtuel" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Mes vélos et mes pneus</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            Suivez les montages, recevez les rappels de remplacement et rachetez le bon pneu sans
            repartir de zéro.
          </p>
        </div>
        <UIButton
          to="/#catalogue"
          text="Voir le catalogue"
          intent="neutral"
          variant="subtle"
          leading-icon="tabler:search"
        />
      </div>

      <UIAlert
        v-if="checkoutOrderId"
        class="mt-6"
        intent="success"
        title="Commande prête à être rangée"
        description="Créez ou ouvrez un vélo, puis ajoutez les pneus de votre commande au garage."
      />

      <UIProgress v-if="garage.pending.value" class="mt-8" intent="primary" label="Chargement..." />
      <UIAlert
        v-else-if="garage.errorMessage.value"
        class="mt-8"
        intent="error"
        title="Garage indisponible"
        :description="garage.errorMessage.value"
      />

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="grid content-start gap-4">
          <div
            v-if="garage.bikes.value.length === 0"
            class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-8 text-center"
          >
            <Icon name="tabler:bike-off" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">Aucun vélo dans le garage</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              Ajoutez votre premier vélo pour associer vos pneus et suivre leur durée de vie.
            </p>
          </div>

          <NuxtLink
            v-for="bike in garage.bikes.value"
            :key="bike.id"
            :to="`/garage/${bike.id}${checkoutOrderId ? `?orderId=${checkoutOrderId}` : ''}`"
            class="block rounded-md border border-neutral-border-default bg-neutral-surface-default p-5 transition hover:border-primary-border-default hover:bg-primary-surface-default"
          >
            <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <h2 class="txt-h4 font-black">{{ bike.name }}</h2>
                  <UIBadge :label="typeLabel(bike.type)" intent="neutral" size="sm" />
                  <UIBadge
                    v-if="primaryReminder(bike)"
                    :label="
                      primaryReminder(bike)?.severity === 'due' ? 'À remplacer' : 'À surveiller'
                    "
                    :intent="reminderIntent(primaryReminder(bike)!.severity)"
                    size="sm"
                  />
                </div>
                <p class="txt-caption mt-1 text-neutral-text-subtle">
                  {{
                    [bike.brand, bike.model, bike.wheelDiameter].filter(Boolean).join(' · ') ||
                    'Profil à compléter'
                  }}
                </p>
              </div>
              <div class="text-left md:text-right">
                <p class="txt-h4 font-black">{{ bike.tireInstallations.length }}</p>
                <p class="txt-caption text-neutral-text-subtle">montage(s)</p>
                <UIButton
                  class="mt-3"
                  text="Supprimer"
                  intent="error"
                  variant="ghost"
                  size="sm"
                  leading-icon="tabler:trash"
                  @click="deleteBike(bike.id, $event)"
                />
              </div>
            </div>
            <p v-if="primaryReminder(bike)" class="txt-caption mt-4 text-neutral-text-subtle">
              {{ primaryReminder(bike)?.message }}
            </p>
          </NuxtLink>
        </div>

        <form
          class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-5"
          @submit.prevent="createBike"
        >
          <h2 class="txt-h4 font-black">Ajouter un vélo</h2>
          <div class="mt-5 grid gap-4">
            <UIFormInput v-model="name" label="Nom" placeholder="Gravel du quotidien" />
            <UIFormSelect
              v-model="selectedType"
              :items="typeItems"
              label="Type"
              placeholder="Choisir"
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <UIFormInput v-model="brand" label="Marque" placeholder="Lapierre" />
              <UIFormInput v-model="model" label="Modèle" placeholder="Crosshill" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UIFormSelect
                v-model="selectedDiameter"
                :items="diameterItems"
                label="Diamètre roues"
                placeholder="Choisir"
              />
              <UIFormInput v-model="annualDistanceKm" label="Km/an" type="number" min="0" />
            </div>
            <p class="txt-caption text-neutral-text-subtle">
              Route et gravel : 700. VTT 29" : saisir 29. Le diamètre affine les suggestions de
              pneus.
            </p>
            <UIAlert
              v-if="createError"
              intent="error"
              title="Vélo incomplet"
              :description="createError"
            />
            <UIButton
              type="submit"
              text="Créer le vélo"
              intent="primary"
              leading-icon="tabler:plus"
              :disabled="garage.pending.value"
            />
          </div>
        </form>
      </div>
    </section>
  </main>
</template>
