<script setup lang="ts">
import type { CategoryFilter } from '~/utils/catalogue'

defineProps<{
  items: Array<{ category: CategoryFilter; count: number; label: string }>
  selectedCategory: CategoryFilter
}>()

const emit = defineEmits<{
  select: [category: CategoryFilter]
}>()
</script>

<template>
  <section id="categories" class="border-b border-neutral-border-subtle bg-neutral-bg-default">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6">
      <div class="flex gap-2 overflow-x-auto pb-1">
        <UIButton
          v-for="item in items"
          :key="item.category"
          type="button"
          :intent="selectedCategory === item.category ? 'primary' : 'neutral'"
          :variant="selectedCategory === item.category ? 'default' : 'subtle'"
          size="lg"
          :ui="{ root: 'shrink-0 justify-start px-4 text-left' }"
          @click="emit('select', item.category)"
        >
          <span class="flex flex-col items-start">
            <span class="txt-label font-black">{{ item.label }}</span>
            <span class="txt-caption opacity-70">{{ item.count }} références</span>
          </span>
        </UIButton>
      </div>
    </div>
  </section>
</template>
