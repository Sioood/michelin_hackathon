<script setup lang="ts">
import { categoryLabels, getCategoryIntent, type Product } from '~/utils/catalogue'

defineProps<{
  product: Product
}>()
</script>

<template>
  <UICard
    intent="neutral"
    variant="default"
    size="md"
    :card-base-ui="{
      root: 'rounded-md bg-neutral-surface-default',
      body: 'flex min-h-[430px] flex-col rounded-md border-neutral-border-subtle p-0',
    }"
  >
    <CatalogueProductTireVisual :category="product.category" />
    <div class="flex flex-1 flex-col p-5">
      <div class="flex items-start justify-between gap-3">
        <div>
          <UIBadge
            :label="categoryLabels[product.category]"
            :intent="getCategoryIntent(product.category)"
            size="sm"
            :ui="{ label: 'txt-caption font-black uppercase' }"
          />
          <h3 class="txt-h6 mt-2 leading-6 font-black">{{ product.rangeName }}</h3>
        </div>
        <UIBadge
          :label="product.productType"
          intent="secondary"
          size="sm"
          :ui="{
            root: 'border-none bg-secondary-fill-default',
            label: 'txt-caption font-black uppercase text-secondary-text-inverse',
          }"
        />
      </div>

      <p class="txt-base mt-3 line-clamp-2 leading-6 text-neutral-text-subtle">
        {{ product.designation }}
      </p>

      <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div class="border-t border-neutral-border-subtle pt-3">
          <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">Dimension</dt>
          <dd class="txt-label mt-1 font-black">
            {{ product.webDiameterMm ?? product.webDiameterInch ?? 'N/A' }}
            <span v-if="product.webWidthMm">x {{ product.webWidthMm }}</span>
          </dd>
        </div>
        <div class="border-t border-neutral-border-subtle pt-3">
          <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">Poids</dt>
          <dd class="txt-label mt-1 font-black">
            {{ product.weightG ? `${product.weightG} g` : 'N/A' }}
          </dd>
        </div>
        <div class="border-t border-neutral-border-subtle pt-3">
          <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">Pression</dt>
          <dd class="txt-label mt-1 font-black">
            <template v-if="product.minPressureBar && product.maxPressureBar">
              {{ product.minPressureBar }}-{{ product.maxPressureBar }} bar
            </template>
            <template v-else>N/A</template>
          </dd>
        </div>
        <div class="border-t border-neutral-border-subtle pt-3">
          <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">CAI</dt>
          <dd class="txt-label mt-1 font-black">{{ product.cai }}</dd>
        </div>
      </dl>

      <div class="mt-5 flex flex-wrap gap-2">
        <UIChip
          v-if="product.tubelessReady"
          label="Tubeless"
          intent="primary"
          size="sm"
          variant="subtle"
        />
        <UIChip
          v-if="product.eBikeReady"
          label="E-bike"
          intent="success"
          size="sm"
          variant="subtle"
        />
        <UIChip
          v-if="product.reflectiveStrip"
          label="Réfléchissant"
          intent="secondary"
          size="sm"
          variant="subtle"
        />
      </div>

      <div class="mt-auto pt-5">
        <p class="txt-caption font-bold text-neutral-text-subtle">
          {{ product.technologies.slice(0, 3).join(' · ') }}
        </p>
      </div>
    </div>
  </UICard>
</template>
