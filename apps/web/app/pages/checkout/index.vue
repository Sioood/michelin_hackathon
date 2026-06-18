<script setup lang="ts">
import type { CheckoutSession } from '~/types/order'

const auth = useAuthStore()
const cart = useCartStore()
const api = useApi()
const { t } = useI18n()
const step = ref(0)
const errorMessage = ref('')
const checkoutPending = ref(false)

const steps = computed(() => [
  t('checkout.steps.cart'),
  t('checkout.steps.delivery'),
  t('checkout.steps.payment'),
])
const progressValue = computed(() => Math.round(((step.value + 1) / steps.value.length) * 100))

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
          <UIBadge :label="$t('checkout.badge')" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">{{ $t('checkout.title') }}</h1>
          <p class="txt-lg mt-3 max-w-2xl text-neutral-text-subtle">
            {{ $t('checkout.description') }}
          </p>
        </div>
        <p class="txt-h4 font-black">{{ formatPrice(cart.totalCents) }}</p>
      </div>

      <UIAlert
        v-if="errorMessage"
        class="mt-6"
        intent="error"
        :title="$t('checkout.errorTitle')"
        :description="errorMessage"
      />

      <UICard
        class="mt-8 w-full"
        intent="neutral"
        variant="default"
        :card-base-ui="{
          root: 'flex w-full min-w-0 max-w-full flex-col',
          body: 'rounded-md p-6',
        }"
      >
        <UISteps
          v-model:step="step"
          class="w-full"
          :items="steps"
          intent="primary"
          show-progress
          size="sm"
          :show-triggers="false"
        >
          <UIStepsContent :index="0" class="w-full">
            <div v-if="cart.isEmpty" class="w-full py-8 text-center">
              <Icon
                name="tabler:shopping-cart-off"
                class="mx-auto size-10 text-neutral-text-subtle"
              />
              <h2 class="txt-h4 mt-4 font-black">{{ $t('checkout.emptyTitle') }}</h2>
              <p class="txt-base mt-2 text-neutral-text-subtle">
                {{ $t('checkout.emptyDescription') }}
              </p>
              <UIButton
                class="mt-5"
                to="/#catalogue"
                :text="$t('common.seeCatalogue')"
                intent="primary"
              />
            </div>

            <div v-else class="mt-6 w-full divide-y divide-neutral-border-subtle">
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

          <UIStepsContent :index="1" class="w-full">
            <div class="mt-6 grid w-full gap-4 md:grid-cols-2">
              <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-4' }">
                <h2 class="txt-h5 font-black">{{ $t('checkout.demoDeliveryTitle') }}</h2>
                <p class="txt-base mt-2 text-neutral-text-subtle">
                  {{ $t('checkout.demoDeliveryDescription') }}
                </p>
              </UICard>
              <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-4' }">
                <h2 class="txt-h5 font-black">{{ $t('checkout.availabilityTitle') }}</h2>
                <p class="txt-base mt-2 text-neutral-text-subtle">
                  {{ $t('checkout.availabilityDescription') }}
                </p>
              </UICard>
            </div>
          </UIStepsContent>

          <UIStepsContent :index="2" class="w-full">
            <div class="mt-6 w-full">
              <h2 class="txt-h4 font-black">{{ $t('checkout.stripeTitle') }}</h2>
              <p class="txt-base mt-2 max-w-2xl text-neutral-text-subtle">
                {{ $t('checkout.stripeDescription') }}
              </p>
              <UIButton
                class="mt-6"
                :text="$t('checkout.payWithStripe')"
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
          class="mt-6 w-full"
          :model-value="progressValue"
          :label="$t('checkout.progress')"
          intent="primary"
        />

        <div class="mt-6 flex w-full justify-between gap-3">
          <UIButton
            type="button"
            :text="$t('common.back')"
            intent="neutral"
            variant="subtle"
            leading-icon="tabler:arrow-left"
            :disabled="step === 0"
            @click="step = Math.max(0, step - 1)"
          />
          <UIButton
            v-if="step < steps.length - 1"
            type="button"
            :text="$t('common.continue')"
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
