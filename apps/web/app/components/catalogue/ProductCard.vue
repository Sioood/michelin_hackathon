<script setup lang="ts">
import { categoryLabels, getCategoryIntent, type Product } from '~/utils/catalogue'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    product: Product
    tags?: string[]
  }>(),
  {
    compact: false,
    tags: () => [],
  },
)

const cart = useCartStore()
const { t } = useI18n()
const productUrl = computed(() => `/products/${props.product.slug}`)
const canAddToCart = computed(() => props.product.id !== undefined && props.product.stock > 0)

const cardBodyClass = computed(() =>
  props.compact
    ? 'flex min-h-0 flex-col rounded-md border-neutral-border-subtle p-0'
    : 'flex min-h-[430px] flex-col rounded-md border-neutral-border-subtle p-0',
)

async function addToCart() {
  if (props.product.id === undefined) {
    return
  }

  await cart.addItem(props.product.id)
}
</script>

<template>
  <UICard
    intent="neutral"
    variant="default"
    size="md"
    class="h-full w-full min-w-0"
    :card-base-ui="{
      root: 'group flex w-full min-w-0 max-w-full flex-col rounded-md bg-neutral-surface-default transition hover:border-primary-border-default',
      body: cardBodyClass,
    }"
  >
    <NuxtLink :to="productUrl" class="flex min-w-0 flex-1 flex-col text-inherit no-underline">
      <CatalogueProductTireVisual
        :category="product.category"
        :preview-seed="product.slug"
        :size="compact ? 'compact' : 'default'"
        class="w-full"
      />
      <div class="flex min-w-0 flex-1 flex-col p-5 pb-0">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <UIBadge
              :label="t(categoryLabels[product.category])"
              :intent="getCategoryIntent(product.category)"
              size="sm"
              variant="subtle"
              :ui="{ label: 'txt-label font-black uppercase' }"
            />
            <h3 class="txt-h6 mt-2 leading-6 font-black group-hover:text-primary-text-default">
              {{ product.rangeName }}
            </h3>
          </div>
          <UIBadge
            :label="product.productType"
            intent="secondary"
            size="sm"
            :ui="{
              root: 'mt-0.5 mr-1 shrink-0 border-none bg-secondary-fill-default',
              label: 'txt-label font-black uppercase text-secondary-text-inverse',
            }"
          />
        </div>

        <p class="txt-base mt-3 line-clamp-2 leading-6 text-neutral-text-subtle">
          {{ product.designation }}
        </p>

        <dl class="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div class="border-t border-neutral-border-subtle pt-3">
            <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('catalogue.productCard.dimension') }}
            </dt>
            <dd class="txt-label mt-1 font-black">
              {{
                product.webDiameterMm ??
                product.webDiameterInch ??
                $t('catalogue.productCard.unavailable')
              }}
              <span v-if="product.webWidthMm">x {{ product.webWidthMm }}</span>
            </dd>
          </div>
          <div class="border-t border-neutral-border-subtle pt-3">
            <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('catalogue.productCard.weight') }}
            </dt>
            <dd class="txt-label mt-1 font-black">
              {{
                product.weightG ? `${product.weightG} g` : $t('catalogue.productCard.unavailable')
              }}
            </dd>
          </div>
          <div class="border-t border-neutral-border-subtle pt-3">
            <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('catalogue.productCard.pressure') }}
            </dt>
            <dd class="txt-label mt-1 font-black">
              <template v-if="product.minPressureBar && product.maxPressureBar">
                {{ product.minPressureBar }}-{{ product.maxPressureBar }} bar
              </template>
              <template v-else>{{ $t('catalogue.productCard.unavailable') }}</template>
            </dd>
          </div>
          <div class="border-t border-neutral-border-subtle pt-3">
            <dt class="txt-caption font-bold text-neutral-text-subtle uppercase">
              {{ $t('catalogue.productCard.cai') }}
            </dt>
            <dd class="txt-label mt-1 font-black">{{ product.cai }}</dd>
          </div>
        </dl>

        <div class="mt-5 flex flex-wrap gap-2">
          <UIBadge
            v-if="product.tubelessReady"
            :label="$t('catalogue.productCard.tubeless')"
            intent="primary"
            size="sm"
            variant="subtle"
          />
          <UIBadge
            v-if="product.eBikeReady"
            :label="$t('catalogue.productCard.eBike')"
            intent="success"
            size="sm"
            variant="subtle"
          />
          <UIBadge
            v-if="product.reflectiveStrip"
            :label="$t('catalogue.productCard.reflective')"
            intent="secondary"
            size="sm"
            variant="subtle"
          />
          <UIBadge
            v-for="tag in tags"
            :key="tag"
            :label="tag"
            intent="info"
            size="sm"
            variant="subtle"
          />
        </div>

        <p class="txt-caption mt-auto pt-5 font-bold text-neutral-text-subtle">
          {{ product.technologies.slice(0, 3).join(' · ') }}
        </p>
      </div>
    </NuxtLink>

    <div class="flex items-center justify-between gap-3 p-5 pt-4">
      <div>
        <p class="txt-h5 font-black">{{ formatPrice(product.priceCents, product.currency) }}</p>
        <p class="txt-caption text-neutral-text-subtle">
          {{
            product.stock > 0
              ? $t('catalogue.stock.inStock', { count: product.stock })
              : $t('catalogue.stock.outOfStock')
          }}
        </p>
      </div>
      <UIButton
        type="button"
        :text="$t('catalogue.productCard.add')"
        intent="primary"
        size="sm"
        leading-icon="tabler:shopping-cart-plus"
        :disabled="!canAddToCart"
        @click="addToCart"
      />
    </div>
  </UICard>
</template>
