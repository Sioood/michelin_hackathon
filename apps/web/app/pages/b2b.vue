<script setup lang="ts">
const { t } = useI18n()

useHead({
  title: t('b2b.headTitle'),
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section
      class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_28rem] lg:items-center"
    >
      <div class="min-w-0">
        <UIBadge :label="$t('b2b.badge')" intent="primary" size="sm" />
        <h1 class="txt-h1 mt-4 font-black">{{ $t('b2b.title') }}</h1>
        <p class="txt-lg mt-4 max-w-3xl text-neutral-text-subtle">
          {{ $t('b2b.description') }}
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UIButton
            to="/"
            :text="$t('common.backToCatalogue')"
            intent="primary"
            leading-icon="tabler:arrow-left"
          />
          <UIButton to="/admin" :text="$t('b2b.adminDemo')" intent="neutral" variant="subtle" />
        </div>
      </div>

      <div class="rounded-md border border-neutral-border-subtle bg-neutral-surface-default p-6">
        <h2 class="txt-h4 font-black">{{ $t('b2b.soon') }}</h2>
        <div class="mt-5 space-y-4">
          <div class="flex items-start gap-3">
            <Icon name="tabler:building-store" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">
              {{ $t('b2b.dealerCatalogue') }}
            </p>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="tabler:truck-delivery" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">{{ $t('b2b.groupedOrders') }}</p>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="tabler:chart-bar" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">
              {{ $t('b2b.indicators') }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
