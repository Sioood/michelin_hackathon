<script setup lang="ts">
const route = useRoute()
const cart = useCartStore()

const orderId = computed(() => {
  const value = route.query.orderId
  return typeof value === 'string' ? value : null
})

onMounted(() => {
  void cart.load()
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <UIBadge label="Commande lancee" intent="success" size="sm" />
      <h1 class="txt-h1 mt-5 font-black">Merci, votre commande est en cours.</h1>
      <p class="txt-lg mt-4 text-neutral-text-subtle">
        Stripe a pris le relais pour le paiement. L'historique sera mis a jour apres confirmation du
        webhook.
      </p>
      <p v-if="orderId" class="txt-label mt-4 font-black">Commande #{{ orderId }}</p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UIButton to="/account/orders" text="Voir mes commandes" intent="primary" />
        <UIButton to="/#catalogue" text="Continuer mes achats" intent="neutral" variant="subtle" />
      </div>
    </section>
  </main>
</template>
