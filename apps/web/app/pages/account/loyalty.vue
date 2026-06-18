<script setup lang="ts">
const auth = useAuthStore()
const loyalty = useLoyalty()
const config = useRuntimeConfig()
const redeemMessage = ref('')

const referralLink = computed(() => {
  if (loyalty.overview.value === null) {
    return ''
  }

  return `${config.public.siteUrl}/register?ref=${loyalty.overview.value.referralCode}`
})

async function copyReferralLink() {
  if (referralLink.value.length === 0) {
    return
  }

  await navigator.clipboard.writeText(referralLink.value)
}

async function redeemReward(rewardId: string) {
  redeemMessage.value = ''
  const result = await loyalty.redeemReward(rewardId)
  redeemMessage.value = result.message
}

onMounted(async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login?redirect=/account/loyalty')
    return
  }

  await loyalty.loadOverview()
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <UIBadge :label="$t('loyalty.account.badge')" intent="secondary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">{{ $t('loyalty.account.title') }}</h1>
          <p class="txt-lg mt-3 text-neutral-text-subtle">
            {{ $t('loyalty.account.description') }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UIButton
            to="/account/orders"
            :text="$t('loyalty.account.orders')"
            intent="neutral"
            variant="subtle"
            leading-icon="tabler:receipt"
          />
          <UIButton
            to="/roulette"
            :text="$t('loyalty.account.roulette')"
            intent="primary"
            leading-icon="tabler:rotate-clockwise"
          />
        </div>
      </div>

      <UIProgress
        v-if="loyalty.pending.value && loyalty.overview.value === null"
        class="mt-8"
        intent="primary"
        :label="$t('loyalty.account.loading')"
      />

      <UIAlert
        v-else-if="loyalty.errorMessage.value && loyalty.overview.value === null"
        class="mt-8"
        intent="error"
        :title="$t('loyalty.account.errorTitle')"
        :description="loyalty.errorMessage.value"
      />

      <template v-else-if="loyalty.overview.value">
        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <UICard intent="primary" variant="default" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold uppercase opacity-80">
              {{ $t('loyalty.account.balance') }}
            </p>
            <p class="txt-h1 mt-2 font-black">
              {{ $t('loyalty.header.points', { count: loyalty.overview.value.balance }) }}
            </p>
          </UICard>
          <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('loyalty.account.welcome') }}
            </p>
            <UIBadge
              class="mt-3"
              :label="
                loyalty.overview.value.welcomeDiscountAvailable
                  ? $t('loyalty.account.welcomeAvailable')
                  : $t('loyalty.account.welcomeUsed')
              "
              :intent="loyalty.overview.value.welcomeDiscountAvailable ? 'success' : 'neutral'"
              size="sm"
            />
          </UICard>
          <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
            <p class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('loyalty.account.referralCode') }}
            </p>
            <p class="txt-h4 mt-2 font-black">{{ loyalty.overview.value.referralCode }}</p>
            <UIButton
              class="mt-4"
              :text="$t('loyalty.account.copyLink')"
              intent="secondary"
              variant="subtle"
              size="sm"
              leading-icon="tabler:link"
              :ui="secondaryButtonUi"
              @click="copyReferralLink"
            />
          </UICard>
        </div>

        <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div class="grid gap-6">
            <section>
              <h2 class="txt-h3 font-black">{{ $t('loyalty.account.rewardsTitle') }}</h2>
              <UIAlert
                v-if="redeemMessage"
                class="mt-4"
                intent="success"
                :title="$t('loyalty.account.rewardActivated')"
                :description="redeemMessage"
              />
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <UICard
                  v-for="reward in loyalty.overview.value.rewards"
                  :key="reward.id"
                  intent="neutral"
                  variant="default"
                  :card-base-ui="{ body: 'rounded-md p-5' }"
                >
                  <h3 class="txt-h5 font-black">{{ reward.name }}</h3>
                  <p class="txt-base mt-2 text-neutral-text-subtle">{{ reward.description }}</p>
                  <div class="mt-4 flex items-center justify-between gap-3">
                    <UIBadge
                      :label="$t('loyalty.account.pointsCost', { count: reward.pointsCost })"
                      intent="primary"
                      size="sm"
                    />
                    <UIButton
                      :text="$t('loyalty.account.redeem')"
                      intent="primary"
                      size="sm"
                      :disabled="
                        loyalty.overview.value.balance < reward.pointsCost || loyalty.pending.value
                      "
                      @click="redeemReward(reward.id)"
                    />
                  </div>
                </UICard>
              </div>
            </section>

            <section>
              <h2 class="txt-h3 font-black">{{ $t('loyalty.account.historyTitle') }}</h2>
              <div
                v-if="loyalty.overview.value.transactions.length === 0"
                class="mt-4 rounded-md border border-neutral-border-default p-6 text-center"
              >
                <p class="txt-base text-neutral-text-subtle">
                  {{ $t('loyalty.account.noHistory') }}
                </p>
              </div>
              <div
                v-else
                class="mt-4 divide-y divide-neutral-border-subtle rounded-md border border-neutral-border-default"
              >
                <div
                  v-for="transaction in loyalty.overview.value.transactions"
                  :key="transaction.id ?? transaction.description"
                  class="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p class="txt-label font-black">{{ transaction.description }}</p>
                    <p class="txt-caption text-neutral-text-subtle">
                      {{
                        transaction.createdAt
                          ? new Date(transaction.createdAt).toLocaleDateString('fr-FR')
                          : ''
                      }}
                    </p>
                  </div>
                  <p
                    class="txt-label font-black"
                    :class="
                      transaction.amount >= 0
                        ? 'text-success-text-default'
                        : 'text-error-text-default'
                    "
                  >
                    {{ transaction.amount >= 0 ? '+' : '' }}{{ transaction.amount }} pts
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div class="grid gap-6">
            <LoyaltyRedeemCodeForm @redeemed="redeemMessage = $event" />

            <UICard
              v-if="loyalty.overview.value.pendingDiscounts.length > 0"
              intent="success"
              variant="subtle"
              :card-base-ui="{ body: 'rounded-md p-5' }"
            >
              <h2 class="txt-h4 font-black">{{ $t('loyalty.account.pendingTitle') }}</h2>
              <ul class="mt-4 grid gap-2">
                <li
                  v-for="discount in loyalty.overview.value.pendingDiscounts"
                  :key="discount.id"
                  class="txt-base text-neutral-text-subtle"
                >
                  <template v-if="discount.type === 'percent'">
                    {{ $t('loyalty.account.pendingPercent', { value: discount.value }) }}
                  </template>
                  <template v-else-if="discount.type === 'fixed_cents'">
                    {{ $t('loyalty.account.pendingFixed', { value: discount.value / 100 }) }}
                  </template>
                  <template v-else>{{ $t('loyalty.account.pendingShipping') }}</template>
                </li>
              </ul>
            </UICard>
          </div>
        </div>
      </template>
    </section>
  </main>
</template>
