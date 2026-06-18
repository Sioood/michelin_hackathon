<script setup lang="ts">
import type { Order } from '~/types/order'

const auth = useAuthStore()
const api = useApi()
const orders = ref<Order[]>([])
const pending = ref(false)
const errorMessage = ref('')

const statusLabels: Record<Order['status'], string> = {
  paid: 'Payée',
  pending: 'En attente',
  shipped: 'Expédiée',
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login?redirect=/account/orders')
    return
  }

  pending.value = true
  try {
    orders.value = await api.request<Order[]>('/orders')
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  } finally {
    pending.value = false
  }
})

async function logout() {
  auth.logout()
  await navigateTo('/login')
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <UIBadge label="Compte client" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Mes commandes</h1>
          <p class="txt-lg mt-3 text-neutral-text-subtle">Suivez vos achats de pneus Michelin.</p>
        </div>
        <UIButton text="Déconnexion" intent="neutral" variant="subtle" @click="logout" />
      </div>

      <UIProgress
        v-if="pending"
        class="mt-8"
        intent="primary"
        label="Chargement des commandes..."
      />
      <UIAlert
        v-else-if="errorMessage"
        class="mt-8"
        intent="error"
        title="Historique indisponible"
        :description="errorMessage"
      />

      <div v-else-if="orders.length === 0" class="mt-10 text-center">
        <Icon name="tabler:receipt-off" class="mx-auto size-10 text-neutral-text-subtle" />
        <h2 class="txt-h4 mt-4 font-black">Aucune commande</h2>
        <UIButton class="mt-5" to="/#catalogue" text="Commander des pneus" intent="primary" />
      </div>

      <div v-else class="mt-8 grid gap-4">
        <UICard
          v-for="order in orders"
          :key="order.id"
          intent="neutral"
          variant="default"
          :card-base-ui="{ body: 'rounded-md p-5' }"
        >
          <div class="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="txt-h4 font-black">Commande #{{ order.id }}</h2>
                <UIBadge :label="statusLabels[order.status]" intent="primary" size="sm" />
              </div>
              <p class="txt-caption mt-1 text-neutral-text-subtle">
                {{
                  order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('fr-FR')
                    : 'Date inconnue'
                }}
              </p>
            </div>
            <p class="txt-h4 font-black">{{ formatPrice(order.totalCents, order.currency) }}</p>
          </div>

          <div class="mt-4 divide-y divide-neutral-border-subtle">
            <div
              v-for="item in order.items ?? []"
              :key="item.id"
              class="flex justify-between gap-4 py-3"
            >
              <div>
                <p class="txt-label font-black">{{ item.productName }}</p>
                <p class="txt-caption text-neutral-text-subtle">Quantité {{ item.quantity }}</p>
              </div>
              <p class="txt-label font-black">{{ formatPrice(item.totalCents, order.currency) }}</p>
            </div>
          </div>
        </UICard>
      </div>
    </section>
  </main>
</template>
