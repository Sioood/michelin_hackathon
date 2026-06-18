<script setup lang="ts">
const auth = useAuthStore()
const cart = useCartStore()

const navItems = [
  { href: '/#categories', labelKey: 'catalogue.nav.tyres' },
  { href: '/#catalogue', labelKey: 'catalogue.nav.catalogue' },
  { href: '/#technologies', labelKey: 'catalogue.nav.technologies' },
  { href: '/garage', labelKey: 'catalogue.nav.garage' },
] as const

onMounted(() => {
  void cart.load()
})
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-primary-border-strong bg-primary-bg-inverse text-primary-text-inverse"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <div class="flex items-center gap-3">
        <div
          class="grid size-11 place-items-center rounded-md bg-secondary-fill-default font-black text-secondary-text-inverse"
        >
          M
        </div>
        <div>
          <p class="txt-label font-black uppercase">Michelin</p>
          <p class="txt-caption text-primary-text-inverse/70">
            {{ $t('catalogue.header.subtitle') }}
          </p>
        </div>
      </div>

      <nav class="hidden items-center gap-6 md:flex">
        <UILink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          intent="neutral"
          variant="ghost"
          :ui="{
            root: 'txt-label font-semibold text-primary-text-inverse/80 hover:text-primary-text-inverse',
          }"
        >
          {{ $t(item.labelKey) }}
        </UILink>
      </nav>

      <SearchAiSearchBar compact class="hidden xl:flex" />

      <div class="flex items-center gap-2">
        <UIButton
          :text="$t('catalogue.header.findTyre')"
          intent="secondary"
          size="sm"
          leading-icon="tabler:circle-filled"
          to="/trouver-mon-pneu"
          class="hidden sm:inline-flex"
        />
        <LoyaltyPointsBadge />
        <UIButton
          v-if="auth.isAuthenticated"
          :text="auth.displayName"
          intent="primary"
          variant="ghost"
          size="sm"
          leading-icon="tabler:user"
          to="/account/orders"
          class="hidden lg:inline-flex"
        />
        <UIButton
          v-else
          :text="$t('catalogue.header.login')"
          intent="primary"
          variant="ghost"
          size="sm"
          leading-icon="tabler:user"
          to="/login"
          class="hidden lg:inline-flex"
        />
        <div class="relative">
          <UIButton
            type="button"
            icon="tabler:shopping-cart"
            aria-label="Ouvrir le panier"
            intent="secondary"
            variant="subtle"
            size="sm"
            @click="cart.openDrawer"
          />
          <span
            v-if="cart.itemCount > 0"
            class="txt-caption absolute -top-2 -right-2 grid min-w-5 place-items-center rounded-full bg-accent-fill-default px-1 font-black text-accent-text-inverse"
          >
            {{ cart.itemCount }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
