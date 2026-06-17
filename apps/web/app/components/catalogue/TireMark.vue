<script setup lang="ts">
import type { ProductCategory } from '~/utils/catalogue'

defineProps<{
  category: ProductCategory
}>()
</script>

<template>
  <div class="tire-mark" :data-category="category" aria-hidden="true" />
</template>

<style scoped>
.tire-mark {
  border: 8px solid var(--color-primary-bg-inverse);
  border-radius: 999px;
  height: 54px;
  position: relative;
  width: 54px;
}

.tire-mark::after {
  background: var(--color-secondary-fill-default);
  border-radius: 999px;
  content: '';
  inset: 12px;
  position: absolute;
}
</style>
