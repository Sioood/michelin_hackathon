<script setup lang="ts">
defineProps<{
  diameterCount: number
  pending: boolean
  useCount: number
}>()
</script>

<template>
  <section id="technologies" class="bg-primary-bg-inverse py-14 text-primary-text-inverse">
    <div class="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p class="txt-brand text-secondary-fill-default">{{ $t('catalogue.tech.eyebrow') }}</p>
        <h2 class="txt-h2 mt-2 font-black">{{ $t('catalogue.tech.title') }}</h2>
        <p class="txt-base mt-4 text-primary-text-inverse/75">
          {{ $t('catalogue.tech.description') }}
        </p>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <UICard
          intent="neutral"
          variant="inverse"
          size="sm"
          :card-base-ui="{
            body: 'rounded-md border border-primary-text-inverse/16 bg-primary-text-inverse/8 p-5',
          }"
        >
          <p class="txt-h4 font-black">{{ useCount }}</p>
          <p class="txt-base mt-1 text-primary-text-inverse/70">
            {{ $t('catalogue.tech.uses') }}
          </p>
        </UICard>
        <UICard
          intent="neutral"
          variant="inverse"
          size="sm"
          :card-base-ui="{
            body: 'rounded-md border border-primary-text-inverse/16 bg-primary-text-inverse/8 p-5',
          }"
        >
          <p class="txt-h4 font-black">{{ diameterCount }}</p>
          <p class="txt-base mt-1 text-primary-text-inverse/70">
            {{ $t('catalogue.tech.diameters') }}
          </p>
        </UICard>
      </div>
    </div>

    <div v-if="pending" class="mx-auto mt-8 max-w-7xl px-4 sm:px-6">
      <UIProgress intent="secondary" size="md" :label="$t('catalogue.tech.loading')" />
    </div>
  </section>
</template>
