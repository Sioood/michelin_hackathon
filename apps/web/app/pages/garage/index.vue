<script setup lang="ts">
import type { Bike, BikeType, CreateBikeInput, GarageReminderSeverity } from '~/types/garage'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

const auth = useAuthStore()
const garage = useGarage()
const route = useRoute()
const { t } = useI18n()

const name = ref('')
const brand = ref('')
const model = ref('')
const annualDistanceKm = ref('2500')
const selectedType = ref<string[]>(['road'])
const createError = ref('')

const bikeTypes = computed<Array<{ label: string; value: BikeType }>>(() => [
  { label: t('garage.bikeTypes.road'), value: 'road' },
  { label: t('garage.bikeTypes.gravel'), value: 'gravel' },
  { label: t('garage.bikeTypes.mtb'), value: 'mtb' },
  { label: t('garage.bikeTypes.eBike'), value: 'e-bike' },
  { label: t('garage.bikeTypes.city'), value: 'city' },
])

const diameterItems: SelectItem[] = [
  { label: '700c — route / gravel', value: '700' },
  { label: '650b / 27,5" — gravel / VTT', value: '27.5' },
  { label: '29" — VTT', value: '29' },
  { label: '28" — ville / trekking', value: '28' },
  { label: '26" — VTT ancien', value: '26' },
]

const selectedDiameter = ref<string[]>(['700'])

const typeItems = computed<SelectItem[]>(() => bikeTypes.value)

const checkoutOrderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? value : null
})

function typeLabel(type: BikeType): string {
  return bikeTypes.value.find((item) => item.value === type)?.label ?? type
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
    createError.value = t('garage.incompleteBikeDescription')
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

  if (!globalThis.confirm(t('garage.confirmDeleteBike'))) {
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
          <UIBadge :label="$t('garage.badge')" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">{{ $t('garage.title') }}</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            {{ $t('garage.description') }}
          </p>
        </div>
        <UIButton
          to="/#catalogue"
          :text="$t('garage.catalogue')"
          intent="neutral"
          variant="subtle"
          leading-icon="tabler:search"
        />
      </div>

      <UIAlert
        v-if="checkoutOrderId"
        class="mt-6"
        intent="success"
        :title="$t('garage.checkoutReadyTitle')"
        :description="$t('garage.checkoutReadyDescription')"
      />

      <UIProgress
        v-if="garage.pending.value"
        class="mt-8"
        intent="primary"
        :label="$t('garage.loading')"
      />
      <UIAlert
        v-else-if="garage.errorMessage.value"
        class="mt-8"
        intent="error"
        :title="$t('garage.unavailableTitle')"
        :description="garage.errorMessage.value"
      />

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div class="grid content-start gap-4">
          <div
            v-if="garage.bikes.value.length === 0"
            class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-8 text-center"
          >
            <Icon name="tabler:bike-off" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">{{ $t('garage.emptyTitle') }}</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              {{ $t('garage.emptyDescription') }}
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
                  <UIBadge :label="typeLabel(bike.type)" intent="neutral" size="md" />
                  <UIBadge
                    v-if="primaryReminder(bike)"
                    :label="
                      primaryReminder(bike)?.severity === 'due'
                        ? $t('garage.detail.statusDue')
                        : $t('garage.detail.statusSoon')
                    "
                    :intent="reminderIntent(primaryReminder(bike)!.severity)"
                    size="md"
                  />
                </div>
                <p class="txt-caption mt-1 text-neutral-text-subtle">
                  {{
                    [bike.brand, bike.model, bike.wheelDiameter].filter(Boolean).join(' · ') ||
                    $t('garage.profileMissing')
                  }}
                </p>
              </div>
              <div class="text-left md:text-right">
                <p class="txt-h4 font-black">{{ bike.tireInstallations.length }}</p>
                <p class="txt-caption text-neutral-text-subtle">{{ $t('garage.installations') }}</p>
                <UIButton
                  class="mt-3"
                  :text="$t('garage.delete')"
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
          <h2 class="txt-h4 font-black">{{ $t('garage.addBike') }}</h2>
          <div class="mt-5 grid gap-4">
            <UIFormInput
              v-model="name"
              :label="$t('garage.fields.name')"
              :placeholder="$t('garage.fields.namePlaceholder')"
            />
            <UIFormSelect
              v-model="selectedType"
              :items="typeItems"
              :label="$t('garage.fields.type')"
              :placeholder="$t('garage.fields.choose')"
            />
            <div class="grid gap-4 sm:grid-cols-2">
              <UIFormInput
                v-model="brand"
                :label="$t('garage.fields.brand')"
                :placeholder="$t('garage.fields.brandPlaceholder')"
              />
              <UIFormInput
                v-model="model"
                :label="$t('garage.fields.model')"
                :placeholder="$t('garage.fields.modelPlaceholder')"
              />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <UIFormSelect
                v-model="selectedDiameter"
                :items="diameterItems"
                :label="$t('garage.fields.diameter')"
                :placeholder="$t('garage.fields.choose')"
              />
              <UIFormInput
                v-model="annualDistanceKm"
                :label="$t('garage.fields.annualDistance')"
                type="number"
                min="0"
              />
            </div>
            <p class="txt-caption text-neutral-text-subtle">
              {{ $t('garage.diameterHelp') }}
            </p>
            <UIAlert
              v-if="createError"
              intent="error"
              :title="$t('garage.incompleteBikeTitle')"
              :description="createError"
            />
            <UIButton
              type="submit"
              :text="$t('garage.createBike')"
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
