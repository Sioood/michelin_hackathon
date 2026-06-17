<script setup lang="ts">
import type { CheckoutSession } from '~/types/order'

const auth = useAuthStore()
const cart = useCartStore()
const api = useApi()
const step = ref(0)
const errorMessage = ref('')
const checkoutPending = ref(false)

const steps = ['Panier', 'Livraison', 'Paiement']
const progressValue = computed(() => Math.round(((step.value + 1) / steps.length) * 100))

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login?redirect=/checkout')
    return
  }

  await cart.load()
})

async function startCheckout() {
  errorMessage.value = ''
  checkoutPending.value = true

  try {
    const session = await api.request<CheckoutSession>('/checkout/session', {
      method: 'POST',
    })
    await navigateTo(session.url, { external: true })
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  } finally {
    checkoutPending.value = false
  }
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <UIBadge label="Checkout securise" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Finaliser la commande</h1>
          <p class="txt-lg mt-3 max-w-2xl text-neutral-text-subtle">
            Verifiez votre panier, confirmez la livraison puis basculez vers Stripe Checkout.
          </p>
        </div>
        <p class="txt-h4 font-black">{{ formatPrice(cart.totalCents) }}</p>
      </div>

      <UIAlert
        v-if="errorMessage"
        class="mt-6"
        intent="error"
        title="Checkout indisponible"
        :description="errorMessage"
      />

      <UICard
        class="mt-8"
        intent="neutral"
        variant="default"
        :card-base-ui="{ body: 'rounded-md p-6' }"
      >
        <UISteps
          v-model:step="step"
          :items="steps"
          intent="primary"
          show-progress
          size="sm"
          :show-triggers="false"
        >
          <UIStepsContent :index="0">
            <div v-if="cart.isEmpty" class="py-8 text-center">
              <Icon
                name="tabler:shopping-cart-off"
                class="mx-auto size-10 text-neutral-text-subtle"
              />
              <h2 class="txt-h4 mt-4 font-black">Panier vide</h2>
              <p class="txt-base mt-2 text-neutral-text-subtle">
                Ajoutez au moins un pneu avant de payer.
              </p>
              <UIButton class="mt-5" to="/#catalogue" text="Voir le catalogue" intent="primary" />
            </div>

            <div v-else class="mt-6 divide-y divide-neutral-border-subtle">
              <article
                v-for="item in cart.cart?.items"
                :key="item.id"
                class="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <h2 class="txt-label font-black">{{ item.product.rangeName }}</h2>
                  <p class="txt-caption mt-1 text-neutral-text-subtle">
                    {{ item.quantity }} x {{ formatPrice(item.product.priceCents) }}
                  </p>
                </div>
                <p class="txt-label font-black">{{ formatPrice(item.subtotalCents) }}</p>
              </article>
            </div>
          </UIStepsContent>

          <UIStepsContent :index="1">
            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-4' }">
                <h2 class="txt-h5 font-black">Livraison demo</h2>
                <p class="txt-base mt-2 text-neutral-text-subtle">
                  Adresse rattachee a votre compte client. La phase hackathon garde Stripe comme
                  source de paiement.
                </p>
              </UICard>
              <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-4' }">
                <h2 class="txt-h5 font-black">Disponibilite</h2>
                <p class="txt-base mt-2 text-neutral-text-subtle">
                  Les stocks sont reserves au moment de la confirmation Stripe.
                </p>
              </UICard>
            </div>
          </UIStepsContent>

          <UIStepsContent :index="2">
            <div class="mt-6">
              <h2 class="txt-h4 font-black">Paiement Stripe</h2>
              <p class="txt-base mt-2 max-w-2xl text-neutral-text-subtle">
                Une session Stripe Checkout sera creee depuis le panier actif.
              </p>
              <UIButton
                class="mt-6"
                text="Payer avec Stripe"
                intent="primary"
                size="lg"
                leading-icon="tabler:credit-card"
                :disabled="cart.isEmpty || checkoutPending"
                :state="checkoutPending ? 'loading' : 'default'"
                @click="startCheckout"
              />
            </div>
          </UIStepsContent>
        </UISteps>

        <UIProgress
          class="mt-6"
          :model-value="progressValue"
          label="Progression"
          intent="primary"
        />

        <div class="mt-6 flex justify-between gap-3">
          <UIButton
            type="button"
            text="Retour"
            intent="neutral"
            variant="subtle"
            leading-icon="tabler:arrow-left"
            :disabled="step === 0"
            @click="step = Math.max(0, step - 1)"
          />
          <UIButton
            v-if="step < steps.length - 1"
            type="button"
            text="Continuer"
            intent="primary"
            trailing-icon="tabler:arrow-right"
            :disabled="cart.isEmpty"
            @click="step = Math.min(steps.length - 1, step + 1)"
          />
        </div>
      </UICard>
    </section>
  </main>
</template>
