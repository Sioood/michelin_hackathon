<script setup lang="ts">
const route = useRoute()
const cart = useCartStore()
const garageDialogOpen = ref(false)

const orderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? value : null
})

const garageUrl = computed(() => (orderId.value ? `/garage?orderId=${orderId.value}` : '/garage'))

onMounted(() => {
  void cart.load()
  garageDialogOpen.value = orderId.value !== null
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <UIBadge label="Commande lancée" intent="success" size="sm" />
      <h1 class="txt-h1 mt-5 font-black">Merci, votre commande est en cours.</h1>
      <p class="txt-lg mt-4 text-neutral-text-subtle">
        Stripe a pris le relais pour le paiement. L'historique sera mis à jour après confirmation du
        webhook.
      </p>
      <p v-if="orderId" class="txt-label mt-4 font-black">Commande #{{ orderId }}</p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UIButton to="/account/orders" text="Voir mes commandes" intent="primary" />
        <UIDialog
          v-model:open="garageDialogOpen"
          title="Ajouter au garage"
          description="Associez cette commande à un vélo pour activer les rappels de remplacement."
          intent="neutral"
          hide-trigger
          :ui="{
            content:
              'border border-neutral-border-default bg-neutral-surface-default text-neutral-text-default',
          }"
        >
          <p class="txt-base text-neutral-text-default">
            Le garage virtuel garde l'historique de vos montages, surveille l'âge et la distance
            parcourue, puis prépare le réachat du bon pneu au bon moment.
          </p>
          <template #footer="{ dialog }">
            <UIButton
              text="Plus tard"
              intent="neutral"
              variant="subtle"
              @click="dialog.setOpen(false)"
            />
            <UIButton
              :to="garageUrl"
              text="Ranger la commande"
              intent="success"
              leading-icon="tabler:archive"
            />
          </template>
        </UIDialog>
        <UIButton
          :to="garageUrl"
          text="Ajouter au garage"
          intent="success"
          leading-icon="tabler:archive"
        />
        <UIButton to="/#catalogue" text="Continuer mes achats" intent="neutral" variant="subtle" />
      </div>
    </section>
  </main>
</template>
