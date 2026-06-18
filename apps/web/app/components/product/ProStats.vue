<script setup lang="ts">
import type { ProductProStats } from '~/types/product'

defineProps<{ stats: ProductProStats }>()
</script>

<template>
  <section class="mt-10">
    <div class="flex flex-wrap items-center gap-3">
      <h2 class="txt-h3 font-black">Performances pros</h2>
      <UIBadge label="Données de démonstration" intent="warning" size="sm" />
    </div>
    <p class="txt-base mt-2 text-neutral-text-subtle">{{ stats.highlight }}</p>
    <p class="txt-caption mt-1 text-neutral-text-subtle">
      Indicateurs générés pour la démonstration du hackathon, non contractuels.
    </p>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
        <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Victoires pro</p>
        <p class="txt-h2 mt-1 font-black text-primary-text-default">{{ stats.victories }}</p>
      </UICard>

      <UICard intent="primary" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
        <p class="txt-caption font-bold text-neutral-text-subtle uppercase">Podiums</p>
        <p class="txt-h2 mt-1 font-black text-primary-text-default">{{ stats.podiums }}</p>
      </UICard>
    </div>

    <div v-if="stats.proTeams.length > 0" class="mt-6">
      <p class="txt-label mb-3 font-bold">Équipes engagées</p>
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
