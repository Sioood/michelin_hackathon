<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type RouletteWheel from '~/components/loyalty/RouletteWheel.vue'

const auth = useAuthStore()
const loyalty = useLoyalty()
const wheelRef = ref<ComponentPublicInstance<typeof RouletteWheel> | null>(null)
const spinError = ref('')

async function handleSpin() {
  spinError.value = ''

  try {
    const result = await loyalty.spinRoulette()
    wheelRef.value?.onSpinComplete(result)
    await loyalty.loadOverview()
  } catch (error) {
    const api = useApi()
    spinError.value = api.getErrorMessage(error)
  }
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login?redirect=/roulette')
    return
  }

  await loyalty.loadOverview()
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-4xl px-4 py-10 text-center sm:px-6">
      <UIBadge :label="$t('loyalty.roulette.badge')" intent="accent" size="sm" />
      <h1 class="txt-h1 mt-4 font-black">{{ $t('loyalty.roulette.title') }}</h1>
      <p class="txt-lg mx-auto mt-3 max-w-2xl text-neutral-text-subtle">
        {{ $t('loyalty.roulette.description') }}
      </p>

      <UIAlert
        v-if="spinError"
        class="mx-auto mt-6 max-w-lg text-left"
        intent="error"
        :title="$t('loyalty.roulette.errorTitle')"
        :description="spinError"
      />

      <div class="mt-10">
        <LoyaltyRouletteWheel
          ref="wheelRef"
          :can-spin="loyalty.canSpinRoulette.value"
          :spinning="loyalty.pending.value"
          @spin="handleSpin"
        />
      </div>

      <p class="txt-base mt-8 text-neutral-text-subtle">
        {{ $t('loyalty.header.points', { count: loyalty.balance.value }) }}
      </p>

      <UIButton
        class="mt-6"
        to="/account/loyalty"
        :text="$t('loyalty.roulette.backToAccount')"
        intent="neutral"
        variant="subtle"
        leading-icon="tabler:arrow-left"
      />
    </section>
  </main>
</template>
