<script setup lang="ts">
const cart = useCartStore()
const auth = useAuthStore()

const open = computed({
  get: () => cart.drawerOpen,
  set: (value) => {
    cart.drawerOpen = value
  },
})

const checkoutTarget = computed(() =>
  auth.isAuthenticated ? '/checkout' : '/login?redirect=/checkout',
)

onMounted(() => {
  void cart.load()
})
</script>

<template>
  <UIDrawer
    v-model:open="open"
    title="Panier"
    description="Vos pneus Michelin avant paiement"
    swipe-direction="end"
    size="lg"
    scrollable
    hide-trigger
    :ui="{
      body: 'w-full max-w-[440px]',
      scrollBody: 'flex min-h-0 flex-col gap-4',
    }"
  >
    <UIAlert
      v-if="cart.errorMessage"
      intent="error"
      title="Panier indisponible"
      :description="cart.errorMessage"
      icon="tabler:alert-circle"
    />

    <div v-if="cart.pending && cart.cart === null" class="py-8">
      <UIProgress intent="primary" size="sm" label="Chargement du panier..." />
    </div>

    <div
      v-else-if="cart.isEmpty"
      class="flex flex-1 flex-col items-center justify-center py-12 text-center"
    >
      <Icon name="tabler:shopping-cart" class="size-10 text-neutral-text-subtle" />
      <h2 class="txt-h5 mt-4 font-black">Votre panier est vide</h2>
      <p class="txt-base mt-2 max-w-xs text-neutral-text-subtle">
        Ajoutez un pneu depuis le catalogue pour demarrer votre commande.
      </p>
      <UIButton
        class="mt-6"
        text="Voir le catalogue"
        intent="primary"
        to="/#catalogue"
        @click="cart.closeDrawer"
      />
    </div>

    <div v-else class="flex flex-1 flex-col gap-4">
      <article
        v-for="item in cart.cart?.items"
        :key="item.id"
        class="grid grid-cols-[72px_1fr] gap-4 border-b border-neutral-border-subtle pb-4"
      >
        <CatalogueProductTireVisual :category="item.product.category" />
        <div class="min-w-0">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="txt-label truncate font-black">{{ item.product.rangeName }}</h3>
              <p class="txt-caption mt-1 line-clamp-2 text-neutral-text-subtle">
                {{ item.product.designation }}
              </p>
            </div>
            <UIButton
              type="button"
              icon="tabler:trash"
              aria-label="Retirer du panier"
              intent="error"
              variant="ghost"
              size="sm"
              @click="cart.removeItem(item.id)"
            />
          </div>

          <div class="mt-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-1">
              <UIButton
                type="button"
                icon="tabler:minus"
                aria-label="Diminuer la quantite"
                intent="neutral"
                variant="subtle"
                size="sm"
                @click="cart.updateItem(item.id, item.quantity - 1)"
              />
              <span class="txt-label grid min-w-8 place-items-center font-black">
                {{ item.quantity }}
              </span>
              <UIButton
                type="button"
                icon="tabler:plus"
                aria-label="Augmenter la quantite"
                intent="neutral"
                variant="subtle"
                size="sm"
                @click="cart.updateItem(item.id, item.quantity + 1)"
              />
            </div>
            <p class="txt-label font-black">{{ formatPrice(item.subtotalCents) }}</p>
          </div>
        </div>
      </article>
    </div>

    <template v-if="!cart.isEmpty" #footer>
      <div class="w-full">
        <div class="mb-4 flex items-center justify-between">
          <span class="txt-label text-neutral-text-subtle">Total</span>
          <span class="txt-h5 font-black">{{ formatPrice(cart.totalCents) }}</span>
        </div>
        <UIButton
          class="w-full"
          text="Passer au paiement"
          intent="primary"
          size="lg"
          leading-icon="tabler:credit-card"
          :to="checkoutTarget"
          @click="cart.closeDrawer"
        />
      </div>
    </template>
  </UIDrawer>
</template>
