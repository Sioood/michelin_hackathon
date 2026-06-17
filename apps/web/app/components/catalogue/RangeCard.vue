<script setup lang="ts">
import { categoryLabels, getCategoryCardIntent, type FeaturedRange } from '~/utils/catalogue'

defineProps<{
  range: FeaturedRange
}>()
</script>

<template>
  <UICard
    :tag="`${range.count} variantes`"
    :subtitle="categoryLabels[range.category]"
    :title="range.rangeName"
    :description="range.headline"
    :element-intent="getCategoryCardIntent(range.category)"
    intent="neutral"
    variant="default"
    size="md"
    :card-base-ui="{
      root: 'group rounded-md bg-neutral-surface-default transition hover:-translate-y-1 hover:shadow-lg',
      body: 'rounded-md border-neutral-border-subtle p-5 group-hover:border-primary-border-default',
    }"
    :ui="{
      bodyTitle: 'txt-h5 font-black text-neutral-text-strong',
      bodyDescription: 'txt-base leading-6 text-neutral-text-subtle',
    }"
  >
    <template #header>
      <div class="flex justify-end p-4">
        <CatalogueTireMark :category="range.category" />
      </div>
    </template>
    <div class="flex flex-wrap gap-2">
      <UIChip
        v-for="technology in range.technologies"
        :key="technology"
        :label="technology"
        intent="neutral"
        size="sm"
        variant="subtle"
      />
    </div>
  </UICard>
</template>
