<script setup lang="ts">
import type { ProductProStats } from '~/types/product'

defineProps<{ stats: ProductProStats }>()
</script>

<template>
  <section class="mt-10">
    <div class="flex flex-wrap items-center gap-3">
      <h2 class="txt-h3 font-black">{{ $t('product.proStats.title') }}</h2>
      <UIBadge :label="$t('product.proStats.badge')" intent="warning" size="sm" />
    </div>
    <p class="txt-base mt-2 text-neutral-text-subtle">{{ stats.highlight }}</p>
    <p class="txt-caption mt-1 text-neutral-text-subtle">
      {{ $t('product.proStats.disclaimer') }}
    </p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
        <p class="txt-caption font-bold text-neutral-text-subtle uppercase">
          {{ $t('product.proStats.victories') }}
        </p>
        <p class="txt-h2 mt-1 font-black text-primary-text-default">{{ stats.victories }}</p>
      </UICard>

      <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
        <p class="txt-caption font-bold text-neutral-text-subtle uppercase">
          {{ $t('product.proStats.podiums') }}
        </p>
        <p class="txt-h2 mt-1 font-black text-primary-text-default">{{ stats.podiums }}</p>
      </UICard>
    </div>

    <div v-if="stats.proTeams.length > 0" class="mt-6">
      <p class="txt-label mb-3 font-bold">{{ $t('product.proStats.teams') }}</p>
      <div class="flex flex-wrap gap-2">
        <UIChip
          v-for="team in stats.proTeams"
          :key="team"
          :label="team"
          intent="secondary"
          variant="subtle"
        />
      </div>
    </div>
  </section>
</template>
