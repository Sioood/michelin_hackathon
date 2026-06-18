<script setup lang="ts">
import { parseDate, type DateValue } from '@internationalized/date'

import type { GarageReminderSeverity, TirePosition } from '~/types/garage'
import type { Order } from '~/types/order'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

const auth = useAuthStore()
const route = useRoute()
const garage = useGarage()
const api = useApi()

const productSelection = ref<string[]>([])
const positionSelection = ref<string[]>(['both'])
const currentDistanceKm = ref('0')
const distanceKmAtInstall = ref('0')
const installedAt = ref<DateValue[]>([parseDate(new Date().toISOString().slice(0, 10))])
const notes = ref('')
const order = ref<Order | null>(null)
const selectedOrderItem = ref<string[]>([])
const checkoutError = ref('')
const profileError = ref('')

const diameterItems: SelectItem[] = [
  { label: '700c — route / gravel', value: '700' },
  { label: '650b / 27,5" — gravel / VTT', value: '27.5' },
  { label: '29" — VTT', value: '29' },
  { label: '28" — ville / trekking', value: '28' },
  { label: '26" — VTT ancien', value: '26' },
]

const selectedDiameter = ref<string[]>([])

const bikeId = computed(() => Number(route.params.bikeId))
const orderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? Number(value) : null
})

const crossSellProductId = computed(() => {
  const installation = garage.currentBike.value?.tireInstallations[0]
  if (installation?.productId !== undefined) {
    return installation.productId
  }

  const selected = Number(productSelection.value[0])
  return Number.isFinite(selected) && selected > 0 ? selected : null
})

const positionItems: SelectItem[] = [
  { label: 'Avant et arrière', value: 'both' },
  { label: 'Avant', value: 'front' },
  { label: 'Arrière', value: 'rear' },
]

const productItems = computed<SelectItem[]>(() =>
  garage.suggestions.value
    .filter((product) => product.id !== undefined && product.id > 0)
    .map((product) => ({
      label: product.rangeName,
      value: String(product.id),
    })),
)

function getInstalledAtIso(): string {
  return installedAt.value[0]?.toString() ?? new Date().toISOString().slice(0, 10)
}

const orderItemOptions = computed<SelectItem[]>(() =>
  (order.value?.items ?? [])
    .filter((item) => item.id !== undefined)
    .map((item) => ({
      label: `${item.productName} · x${item.quantity}`,
      value: String(item.id),
    })),
)

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

function positionLabel(position: TirePosition): string {
  return positionItems.find((item) => item.value === position)?.label ?? position
}

async function refreshSuggestions() {
  const bike = garage.currentBike.value
  await garage.loadSuggestions(bike?.type, bike?.wheelDiameter, bikeId.value)
}

function syncDiameterFromBike() {
  const diameter = garage.currentBike.value?.wheelDiameter
  if (!diameter) {
    selectedDiameter.value = []
    return
  }

  const lower = diameter.toLowerCase()
  if (lower.includes('700') || lower === '622') {
    selectedDiameter.value = ['700']
    return
  }

  if (lower.includes('27.5') || lower.includes('650')) {
    selectedDiameter.value = ['27.5']
    return
  }

  if (lower.includes('29')) {
    selectedDiameter.value = ['29']
    return
  }

  if (lower.includes('28')) {
    selectedDiameter.value = ['28']
    return
  }

  if (lower.includes('26')) {
    selectedDiameter.value = ['26']
    return
  }

  selectedDiameter.value = [diameter]
}

async function saveDiameter() {
  profileError.value = ''
  const [diameter] = selectedDiameter.value

  if (!diameter) {
    profileError.value = 'Choisissez un diamètre pour affiner les suggestions.'
    return
  }

  await garage.updateBike(bikeId.value, { wheelDiameter: diameter })
  await refreshSuggestions()
}

async function deleteBike() {
  if (!globalThis.confirm('Supprimer ce vélo du garage ?')) {
    return
  }

  await garage.removeBike(bikeId.value)
  await navigateTo('/garage')
}

async function installSelectedTire() {
  const productId = Number(productSelection.value[0])
  const position = positionSelection.value[0] as TirePosition | undefined
  const currentDistance = Number(currentDistanceKm.value)
  const installDistance = Number(distanceKmAtInstall.value)
  const selectedItemId = Number(selectedOrderItem.value[0])
  const sourceItem = order.value?.items?.find((item) => item.id === selectedItemId)

  if (!Number.isFinite(productId) || productId <= 0) {
    checkoutError.value = 'Sélectionnez un pneu à ajouter.'
    return
  }

  checkoutError.value = ''
  await garage.installTire(bikeId.value, {
    currentDistanceKm: Number.isFinite(currentDistance) ? currentDistance : 0,
    distanceKmAtInstall: Number.isFinite(installDistance) ? installDistance : 0,
    installedAt: getInstalledAtIso(),
    notes: notes.value.trim() || undefined,
    orderId: sourceItem && orderId.value !== null ? orderId.value : undefined,
    orderItemId: sourceItem?.id,
    position,
    productId,
  })
  productSelection.value = []
  selectedOrderItem.value = []
  notes.value = ''
}

async function installFromOrder() {
  const itemId = Number(selectedOrderItem.value[0])
  const item = order.value?.items?.find((entry) => entry.id === itemId)

  if (!item || item.id === undefined || orderId.value === null) {
    checkoutError.value = 'Sélectionnez un pneu de la commande.'
    return
  }

  checkoutError.value = ''
  await garage.installTire(bikeId.value, {
    currentDistanceKm: 0,
    distanceKmAtInstall: 0,
    installedAt: getInstalledAtIso(),
    orderId: orderId.value,
    orderItemId: item.id,
    position: positionSelection.value[0] as TirePosition | undefined,
    productId: item.productId,
  })
  selectedOrderItem.value = []
}

async function updateDistance(installationId: number, currentDistance: number) {
  await garage.updateTireInstallation(bikeId.value, installationId, {
    currentDistanceKm: currentDistance + 250,
  })
}

async function removeInstallation(installationId: number) {
  await garage.removeTireInstallation(bikeId.value, installationId)
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }

  if (!Number.isFinite(bikeId.value)) {
    await navigateTo('/garage')
    return
  }

  await garage.loadBike(bikeId.value)
  syncDiameterFromBike()
  await refreshSuggestions()

  if (orderId.value !== null && Number.isFinite(orderId.value)) {
    order.value = await api.request<Order>(`/orders/${orderId.value}`)
  }
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <UIButton
        to="/garage"
        text="Retour au garage"
        intent="neutral"
        variant="subtle"
        leading-icon="tabler:arrow-left"
      />

      <UIProgress
        v-if="garage.pending.value && !garage.currentBike.value"
        class="mt-8"
        intent="primary"
        label="Chargement du vélo..."
      />
      <UIAlert
        v-else-if="garage.errorMessage.value && !garage.currentBike.value"
        class="mt-8"
        intent="error"
        title="Vélo indisponible"
        :description="garage.errorMessage.value"
      />

      <template v-else-if="garage.currentBike.value">
        <div class="mt-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <UIBadge label="Garage virtuel" intent="primary" size="sm" />
            <h1 class="txt-h1 mt-4 font-black">{{ garage.currentBike.value.name }}</h1>
            <p class="txt-lg mt-3 text-neutral-text-subtle">
              {{
                [
                  garage.currentBike.value.brand,
                  garage.currentBike.value.model,
                  garage.currentBike.value.wheelDiameter,
                ]
                  .filter(Boolean)
                  .join(' · ') || 'Profil vélo'
              }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <UIButton
              text="Actualiser les suggestions"
              intent="neutral"
              variant="subtle"
              leading-icon="tabler:refresh"
              @click="refreshSuggestions"
            />
            <UIButton
              text="Supprimer le vélo"
              intent="error"
              variant="subtle"
              leading-icon="tabler:trash"
              @click="deleteBike"
            />
          </div>
        </div>

        <UIAlert
          v-if="garage.errorMessage.value"
          class="mt-6"
          intent="error"
          title="Action impossible"
          :description="garage.errorMessage.value"
        />

        <div class="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
          <div class="grid content-start gap-4">
            <h2 class="txt-h3 font-black">Pneus montés</h2>

            <div
              v-if="garage.currentBike.value.tireInstallations.length === 0"
              class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-8 text-center"
            >
              <Icon name="tabler:circle-off" class="mx-auto size-10 text-neutral-text-subtle" />
              <h3 class="txt-h4 mt-4 font-black">Aucun pneu enregistré</h3>
              <p class="txt-base mt-2 text-neutral-text-subtle">
                Ajoutez un pneu pour activer les rappels de remplacement.
              </p>
            </div>

            <div
              v-for="installation in garage.currentBike.value.tireInstallations"
              :key="installation.id"
              class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-5"
            >
              <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="txt-h4 font-black">
                      {{ installation.product.rangeName }}
                    </h3>
                    <UIBadge
                      :label="positionLabel(installation.position)"
                      intent="neutral"
                      size="md"
                    />
                    <UIBadge
                      v-if="installation.reminder"
                      :label="
                        installation.reminder.severity === 'due'
                          ? 'À remplacer'
                          : installation.reminder.severity === 'soon'
                            ? 'À surveiller'
                            : 'OK'
                      "
                      :intent="reminderIntent(installation.reminder.severity)"
                      size="md"
                    />
                  </div>
                  <p class="txt-caption mt-1 text-neutral-text-subtle">
                    {{ installation.product.designation }}
                  </p>
                </div>
                <GarageReorderButton
                  v-if="installation.productId"
                  :product-id="installation.productId"
                  :quantity="installation.position === 'both' ? 2 : 1"
                />
              </div>

              <div class="mt-4 grid gap-3 text-sm text-neutral-text-subtle sm:grid-cols-3">
                <p>
                  <span class="font-bold text-neutral-text-default">Installé</span><br />
                  {{ new Date(installation.installedAt).toLocaleDateString('fr-FR') }}
                </p>
                <p>
                  <span class="font-bold text-neutral-text-default">Distance</span><br />
                  {{ installation.currentDistanceKm - installation.distanceKmAtInstall }} km
                </p>
                <p>
                  <span class="font-bold text-neutral-text-default">CAI</span><br />
                  {{ installation.product.cai }}
                </p>
              </div>

              <p v-if="installation.reminder" class="txt-caption mt-4 text-neutral-text-subtle">
                {{ installation.reminder.message }}
              </p>

              <div class="mt-4 flex flex-wrap gap-2">
                <UIButton
                  text="+250 km"
                  intent="neutral"
                  variant="subtle"
                  size="sm"
                  leading-icon="tabler:gauge"
                  @click="updateDistance(installation.id, installation.currentDistanceKm)"
                />
                <UIButton
                  text="Retirer"
                  intent="error"
                  variant="subtle"
                  size="sm"
                  leading-icon="tabler:trash"
                  @click="removeInstallation(installation.id)"
                />
              </div>
            </div>
          </div>

          <aside class="grid min-w-0 content-start gap-4">
            <div
              class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-5"
            >
              <h2 class="txt-h4 font-black">Profil du vélo</h2>
              <p class="txt-caption mt-2 text-neutral-text-subtle">
                Type : {{ garage.currentBike.value.type }}. Le diamètre filtre les pneus
                compatibles.
              </p>
              <div class="mt-4 grid gap-4">
                <UIFormSelect
                  v-model="selectedDiameter"
                  :items="diameterItems"
                  label="Diamètre roues"
                  placeholder="Choisir"
                />
                <UIAlert
                  v-if="profileError"
                  intent="error"
                  title="Profil incomplet"
                  :description="profileError"
                />
                <UIButton
                  text="Enregistrer le diamètre"
                  intent="neutral"
                  variant="subtle"
                  leading-icon="tabler:device-floppy"
                  :disabled="garage.pending.value"
                  @click="saveDiameter"
                />
              </div>
            </div>

            <form
              class="rounded-md border border-neutral-border-default bg-neutral-surface-default p-5"
              @submit.prevent="installSelectedTire"
            >
              <h2 class="txt-h4 font-black">Ajouter un pneu conseillé</h2>
              <UIAlert
                v-if="productItems.length === 0 && !garage.pending.value"
                class="mt-4"
                intent="warning"
                title="Aucune suggestion"
                description="Enregistrez le diamètre du vélo (700 pour route/gravel, 29 pour VTT), puis actualisez. Si le problème persiste, redémarrez l’API."
              />
              <div class="mt-5 grid gap-4">
                <UIFormSelect
                  v-model="productSelection"
                  :items="productItems"
                  label="Pneu"
                  placeholder="Choisir une référence"
                  empty-text="Aucune suggestion"
                  :ui="{ valueText: 'min-w-0 truncate' }"
                />
                <UIFormSelect v-model="positionSelection" :items="positionItems" label="Position" />
                <div class="grid gap-4 sm:grid-cols-2">
                  <UIFormInput
                    v-model="distanceKmAtInstall"
                    label="Km pose"
                    type="number"
                    min="0"
                  />
                  <UIFormInput
                    v-model="currentDistanceKm"
                    label="Km actuel"
                    type="number"
                    min="0"
                  />
                </div>
                <UIFormDatePicker
                  v-model="installedAt"
                  label="Date de pose"
                  selection-mode="single"
                />
                <UIFormInput
                  v-model="notes"
                  label="Notes"
                  placeholder="Usage hiver, chambre neuve..."
                />
                <UIAlert
                  v-if="checkoutError"
                  intent="error"
                  title="Montage incomplet"
                  :description="checkoutError"
                />
                <UIButton
                  type="submit"
                  text="Ajouter au garage"
                  intent="primary"
                  leading-icon="tabler:plus"
                  :disabled="garage.pending.value"
                />
              </div>
            </form>

            <div
              v-if="order"
              class="rounded-md border border-success-border-default bg-success-surface-default p-5"
            >
              <UIBadge label="Commande récente" intent="success" size="sm" />
              <h2 class="txt-h4 mt-3 font-black">Ajouter depuis la commande #{{ order.id }}</h2>
              <div class="mt-5 grid gap-4">
                <UIFormSelect
                  v-model="selectedOrderItem"
                  :items="orderItemOptions"
                  label="Pneu acheté"
                  placeholder="Choisir un article"
                />
                <UIFormSelect v-model="positionSelection" :items="positionItems" label="Position" />
                <UIButton
                  text="Ranger cette commande"
                  intent="success"
                  leading-icon="tabler:archive"
                  :disabled="garage.pending.value"
                  @click="installFromOrder"
                />
              </div>
            </div>
          </aside>
        </div>

        <CommerceCrossSellCarousel
          class="mt-10"
          :product-id="crossSellProductId"
          title="Accessoires recommandés pour ce vélo"
        />
      </template>
    </section>
  </main>
</template>
