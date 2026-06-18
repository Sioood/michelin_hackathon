<script setup lang="ts">
defineProps<{
  stats: Array<{ label: string; value: string }>
}>()
</script>

<template>
  <section class="relative overflow-hidden bg-primary-bg-inverse text-primary-text-inverse">
    <NuxtImg
      src="/images/bicycle-hero.png"
      alt=""
      class="absolute inset-0 size-full object-cover opacity-55"
      width="1920"
      height="1080"
      loading="eager"
    />
    <div
      class="absolute inset-0 bg-[linear-gradient(90deg,var(--color-primary-bg-inverse)_0%,color-mix(in_srgb,var(--color-primary-bg-inverse)_94%,transparent)_35%,color-mix(in_srgb,var(--color-primary-bg-inverse)_30%,transparent)_100%)]"
    />
    <div
      class="relative mx-auto grid min-h-[620px] max-w-7xl content-end px-4 py-10 sm:px-6 lg:grid-cols-[0.96fr_1fr] lg:py-16"
    >
      <div class="pb-10">
        <UIBadge
          :label="$t('catalogue.hero.badge')"
          intent="secondary"
          size="lg"
          :ui="{
            root: 'mb-4 border-none bg-secondary-fill-default px-3 py-1',
            label: 'txt-label font-black uppercase text-secondary-text-inverse',
          }"
        />
        <h1
          class="txt-title max-w-3xl leading-[0.96] font-black tracking-normal sm:text-6xl lg:text-7xl"
        >
          {{ $t('catalogue.hero.title') }}
        </h1>
        <p class="txt-base mt-6 max-w-2xl leading-8 text-primary-text-inverse/84">
          {{ $t('catalogue.hero.description') }}
        </p>
        <div class="mt-8">
          <SearchAiSearchBar redirect-on-search />
        </div>
        <div class="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
          <UICard
            v-for="stat in stats"
            :key="stat.label"
            intent="neutral"
            variant="inverse"
            size="sm"
            :card-base-ui="{
              root: 'rounded-md bg-primary-text-inverse/10 backdrop-blur',
              body: 'rounded-md border border-primary-text-inverse/18 bg-primary-text-inverse/10 p-4',
            }"
          >
            <p class="txt-h4 font-black text-secondary-fill-default">{{ stat.value }}</p>
            <p class="txt-caption mt-1 font-semibold text-primary-text-inverse/72 uppercase">
              {{ stat.label }}
            </p>
          </UICard>
        </div>
      </div>
    </div>
  </section>
</template>
