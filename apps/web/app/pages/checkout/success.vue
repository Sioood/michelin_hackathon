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
      <UIBadge :label="$t('checkout.success.badge')" intent="success" size="sm" />
      <h1 class="txt-h1 mt-5 font-black">{{ $t('checkout.success.title') }}</h1>
      <p class="txt-lg mt-4 text-neutral-text-subtle">
        {{ $t('checkout.success.description') }}
      </p>
      <p v-if="orderId" class="txt-label mt-4 font-black">
        {{ $t('checkout.success.orderNumber', { id: orderId }) }}
      </p>

      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <UIButton to="/account/orders" :text="$t('checkout.success.orders')" intent="primary" />
        <UIDialog
          v-model:open="garageDialogOpen"
          :title="$t('checkout.success.garageTitle')"
          :description="$t('checkout.success.garageDescription')"
          intent="success"
          hide-trigger
        >
          <p class="txt-base text-neutral-text-default">
            {{ $t('checkout.success.garageBody') }}
          </p>
          <template #footer="{ dialog }">
            <UIButton
              :text="$t('checkout.success.later')"
              intent="neutral"
              variant="subtle"
              @click="dialog.setOpen(false)"
            />
            <UIButton
              :to="garageUrl"
              :text="$t('checkout.success.storeOrder')"
              intent="success"
              leading-icon="tabler:archive"
            />
          </template>
        </UIDialog>
        <UIButton
          :to="garageUrl"
          :text="$t('checkout.success.addToGarage')"
          intent="success"
          leading-icon="tabler:archive"
        />
        <UIButton
          to="/#catalogue"
          :text="$t('checkout.success.continueShopping')"
          intent="neutral"
          variant="subtle"
        />
      </div>
    </section>
  </main>
</template>
