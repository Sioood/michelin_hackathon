<script setup lang="ts">
import { categoryLabels, getCategoryCardIntent, type FeaturedRange } from '~/utils/catalogue'

const props = defineProps<{
  range: FeaturedRange
}>()

const rangeLink = computed(() => ({
  hash: '#catalogue',
  path: '/',
  query: { category: props.range.category },
}))
</script>

<template>
  <NuxtLink
    :to="rangeLink"
    class="block h-full w-full max-w-full min-w-0 rounded-md transition hover:-translate-y-1 hover:shadow-lg"
  >
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
        root: 'group flex h-full w-full min-w-0 max-w-full flex-col rounded-md bg-neutral-surface-default',
        body: 'relative min-w-0 rounded-md border-neutral-border-subtle p-0 group-hover:border-primary-border-default',
      }"
      :ui="{
        content: 'min-w-0',
        bodyTitle: 'txt-h5 line-clamp-2 font-black text-neutral-text-strong',
        bodyDescription: 'txt-base line-clamp-2 leading-6 text-neutral-text-subtle',
      }"
    >
      <template #header>
        <div class="flex justify-end p-4">
          <CatalogueProductTireVisual
            :category="range.category"
            :preview-seed="range.sample.slug"
            size="compact"
            class="h-20 w-full"
          />
        </div>
      </template>
      <div class="flex flex-wrap gap-2 px-5 pb-5">
        <UIBadge
          v-for="technology in range.technologies"
          :key="technology"
          :label="technology"
          intent="neutral"
          size="sm"
          variant="subtle"
        />
      </div>
    </UICard>
  </NuxtLink>
</template>
