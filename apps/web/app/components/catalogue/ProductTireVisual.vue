<script setup lang="ts">
import type { ProductCategory } from '~/utils/catalogue'

import { getTirePreviewImage } from '~/utils/tire-preview'

const props = withDefaults(
  defineProps<{
    category: ProductCategory
    previewSeed?: string
    size?: 'default' | 'compact'
  }>(),
  {
    previewSeed: undefined,
    size: 'default',
  },
)

const previewSrc = computed(() =>
  props.previewSeed ? getTirePreviewImage(props.previewSeed) : null,
)
</script>

<template>
  <div
    class="product-visual overflow-hidden"
    :class="[
      previewSrc ? 'product-visual--photo relative' : 'grid place-items-center',
      size === 'compact' ? 'min-h-0' : 'min-h-44',
    ]"
    :data-category="category"
    :data-size="size"
  >
    <NuxtImg
      v-if="previewSrc"
      fill
      :src="previewSrc"
      :alt="`Pneu ${category}`"
      class="mx-auto h-full object-cover"
      loading="lazy"
      format="webp"
      sizes="(max-width: 640px) 100vw, 420px"
    />
    <div v-else class="tire-visual" aria-hidden="true">
      <span />
    </div>
  </div>
</template>

<style scoped>
.product-visual--photo {
  background: #ffffff;
  border-bottom: 1px solid var(--color-neutral-border-subtle);
}

.product-visual:not(.product-visual--photo) {
  background:
    radial-gradient(
      circle at 70% 20%,
      color-mix(in srgb, var(--color-secondary-fill-default) 42%, transparent),
      transparent 22%
    ),
    linear-gradient(
      135deg,
      var(--color-neutral-bg-subtle) 0%,
      var(--color-neutral-bg-default) 54%,
      var(--color-neutral-bg-strong) 100%
    );
}

.product-visual:not(.product-visual--photo)[data-category='road'] {
  background:
    radial-gradient(
      circle at 75% 20%,
      color-mix(in srgb, var(--color-secondary-fill-default) 48%, transparent),
      transparent 22%
    ),
    linear-gradient(
      135deg,
      var(--color-primary-bg-subtle) 0%,
      var(--color-neutral-bg-default) 55%,
      var(--color-primary-bg-strong) 100%
    );
}

.product-visual:not(.product-visual--photo)[data-category='mtb'] {
  background:
    radial-gradient(
      circle at 75% 20%,
      color-mix(in srgb, var(--color-secondary-fill-default) 42%, transparent),
      transparent 22%
    ),
    linear-gradient(
      135deg,
      var(--color-success-bg-subtle, var(--color-neutral-bg-subtle)) 0%,
      var(--color-neutral-bg-default) 50%,
      color-mix(in srgb, var(--color-success-fill-subtle) 40%, var(--color-neutral-bg-strong)) 100%
    );
}

.product-visual:not(.product-visual--photo)[data-category='gravel'] {
  background:
    radial-gradient(
      circle at 75% 20%,
      color-mix(in srgb, var(--color-secondary-fill-default) 42%, transparent),
      transparent 22%
    ),
    linear-gradient(
      135deg,
      var(--color-warning-bg-subtle, var(--color-neutral-bg-subtle)) 0%,
      var(--color-neutral-bg-default) 50%,
      color-mix(in srgb, var(--color-warning-fill-subtle) 35%, var(--color-neutral-bg-strong)) 100%
    );
}

.tire-visual {
  align-items: center;
  border: 22px solid var(--color-neutral-text-strong);
  border-radius: 999px;
  box-shadow:
    inset 0 0 0 5px var(--color-neutral-border-strong),
    0 18px 40px color-mix(in srgb, var(--color-primary-bg-inverse) 22%, transparent);
  display: flex;
  height: 134px;
  justify-content: center;
  position: relative;
  width: 134px;
}

.tire-visual::before,
.tire-visual::after {
  background: repeating-linear-gradient(
    90deg,
    var(--color-neutral-border-strong) 0 6px,
    var(--color-neutral-text-strong) 6px 12px
  );
  content: '';
  height: 16px;
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
  width: 142px;
}

.tire-visual::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.tire-visual span {
  background: var(--color-neutral-bg-default);
  border: 3px solid var(--color-neutral-border-default);
  border-radius: 999px;
  height: 56px;
  position: relative;
  width: 56px;
  z-index: 1;
}

.product-visual[data-size='compact'] .tire-visual {
  border-width: 8px;
  box-shadow:
    inset 0 0 0 2px var(--color-neutral-border-strong),
    0 4px 12px color-mix(in srgb, var(--color-primary-bg-inverse) 18%, transparent);
  height: 48px;
  width: 48px;
}

.product-visual[data-size='compact'] .tire-visual::before,
.product-visual[data-size='compact'] .tire-visual::after {
  height: 6px;
  width: 52px;
}

.product-visual[data-size='compact'] .tire-visual span {
  border-width: 2px;
  height: 20px;
  width: 20px;
}
</style>
