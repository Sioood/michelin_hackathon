<script setup lang="ts">
import { categoryLabels } from '~/utils/catalogue'

useHead({
  title: 'Admin Michelin',
})

const auth = useAuthStore()
const admin = useAdmin()
const route = useRoute()

const loginTarget = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)
const orderStatusLabels = {
  paid: 'Payées',
  pending: 'En attente',
  shipped: 'Expédiées',
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

onMounted(() => {
  if (auth.isAuthenticated) {
    void admin.loadOverview()
  }
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <UIBadge label="Back-office" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Pilotage commandes & stocks</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            Vue synthétique pour suivre les ventes, les commandes récentes et les références à
            réapprovisionner.
          </p>
        </div>
        <UIButton
          v-if="auth.isAuthenticated"
          type="button"
          text="Actualiser"
          intent="primary"
          leading-icon="tabler:refresh"
          :disabled="admin.pending.value"
          :state="admin.pending.value ? 'loading' : 'default'"
          @click="admin.loadOverview"
        />
      </div>

      <div v-if="!auth.isAuthenticated" class="mt-8 max-w-xl">
        <UIAlert
          intent="info"
          title="Connexion requise"
          description="Le dashboard admin utilise les mêmes accès JWT que le reste de l'application."
        />
        <UIButton class="mt-4" :to="loginTarget" text="Se connecter" intent="primary" />
      </div>

      <UIAlert
        v-else-if="admin.errorMessage.value"
        class="mt-8"
        intent="error"
        title="Dashboard indisponible"
        :description="admin.errorMessage.value"
      />

      <UIProgress
        v-else-if="admin.pending.value || admin.overview.value === null"
        class="mt-10"
        intent="primary"
        label="Chargement des indicateurs..."
      />

      <div v-else class="mt-8 space-y-8">
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">CA payé</p>
            <p class="txt-h3 mt-2 font-black">
              {{ formatPrice(admin.overview.value.orders.totalRevenueCents, 'EUR') }}
            </p>
          </UICard>
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Commandes</p>
            <p class="txt-h3 mt-2 font-black">{{ admin.overview.value.orders.total }}</p>
          </UICard>
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Unités stock</p>
            <p class="txt-h3 mt-2 font-black">{{ admin.overview.value.stocks.totalUnits }}</p>
          </UICard>
          <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Alertes stock</p>
            <p class="txt-h3 mt-2 font-black">{{ admin.overview.value.stocks.lowStockCount }}</p>
          </UICard>
        </div>

        <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <section class="min-w-0">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="txt-brand text-primary-text-default">Commandes</p>
                <h2 class="txt-h3 mt-1 font-black">Dernières ventes</h2>
              </div>
            </div>

            <div class="mt-4 overflow-hidden rounded-md border border-neutral-border-subtle">
              <div
                v-for="order in admin.overview.value.orders.recent"
                :key="order.id"
                class="grid gap-3 border-b border-neutral-border-subtle bg-neutral-surface-default p-4 last:border-b-0 md:grid-cols-[1fr_auto_auto]"
              >
                <div class="min-w-0">
                  <p class="txt-label font-black">Commande #{{ order.id }}</p>
                  <p class="txt-sm mt-1 truncate text-neutral-text-subtle">
                    {{ order.customer }} · {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <UIBadge
                  :label="orderStatusLabels[order.status]"
                  :intent="order.status === 'paid' ? 'success' : 'warning'"
                  size="sm"
                  variant="subtle"
                />
                <div class="text-left md:text-right">
                  <p class="txt-label font-black">
                    {{ formatPrice(order.totalCents, order.currency) }}
                  </p>
                  <p class="txt-caption text-neutral-text-subtle">
                    {{ order.itemCount }} article(s)
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside class="min-w-0 space-y-6">
            <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
              <h2 class="txt-h5 font-black">Statuts</h2>
              <div class="mt-4 space-y-3">
                <div
                  v-for="stat in admin.overview.value.orders.byStatus"
                  :key="stat.status"
                  class="flex items-center justify-between gap-3"
                >
                  <span class="txt-sm text-neutral-text-subtle">
                    {{ orderStatusLabels[stat.status] }}
                  </span>
                  <span class="txt-label font-black">{{ stat.count }}</span>
                </div>
              </div>
            </UICard>

            <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
              <h2 class="txt-h5 font-black">Stocks bas</h2>
              <div class="mt-4 space-y-3">
                <NuxtLink
                  v-for="product in admin.overview.value.stocks.lowStock"
                  :key="product.id"
                  :to="`/products/${product.slug}`"
                  class="block rounded-md bg-neutral-bg-subtle p-3 text-inherit no-underline"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="txt-label truncate font-black">{{ product.rangeName }}</p>
                      <p class="txt-caption mt-1 text-neutral-text-subtle">
                        {{ categoryLabels[product.category] }}
                      </p>
                    </div>
                    <UIBadge
                      :label="`${product.stock}`"
                      :intent="product.stock === 0 ? 'error' : 'warning'"
                      size="sm"
                    />
                  </div>
                </NuxtLink>
              </div>
            </UICard>
          </aside>
        </div>
      </div>
    </section>
  </main>
</template>
