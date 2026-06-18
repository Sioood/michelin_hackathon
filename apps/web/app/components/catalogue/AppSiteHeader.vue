<script setup lang="ts">
const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()

const navItems = [
  { href: '/#categories', labelKey: 'catalogue.nav.tyres' },
  { href: '/#catalogue', labelKey: 'catalogue.nav.catalogue' },
  { href: '/#technologies', labelKey: 'catalogue.nav.technologies' },
  { href: '/garage', labelKey: 'catalogue.nav.garage' },
] as const

const toolItems = [
  {
    activeClass:
      'border-secondary-border-default! bg-secondary-fill-default! text-secondary-text-inverse! shadow-sm',
    href: '/trouver-mon-pneu',
    icon: 'tabler:sparkles',
    labelKey: 'catalogue.tools.findTyre',
    restClass:
      'border-secondary-border-subtle! bg-secondary-bg-subtle! text-secondary-text-strong! hover:border-secondary-border-default! hover:bg-secondary-fill-default! hover:text-secondary-text-inverse!',
  },
  {
    activeClass:
      'border-primary-border-default! bg-primary-fill-default! text-primary-text-inverse! shadow-sm',
    href: '/comparer',
    icon: 'tabler:arrows-diff',
    labelKey: 'catalogue.tools.compare',
    restClass:
      'border-primary-border-subtle! bg-primary-bg-subtle! text-primary-text-strong! hover:border-primary-border-default! hover:bg-primary-fill-default! hover:text-primary-text-inverse!',
  },
  {
    activeClass:
      'border-accent-border-default! bg-accent-fill-default! text-accent-text-inverse! shadow-sm',
    href: '/calculateur-pression',
    icon: 'tabler:gauge',
    labelKey: 'catalogue.tools.pressure',
    restClass:
      'border-accent-border-subtle! bg-accent-bg-subtle! text-accent-text-strong! hover:border-accent-border-default! hover:bg-accent-fill-default! hover:text-accent-text-inverse!',
  },
] as const

function getToolClass(item: (typeof toolItems)[number]): string {
  return route.path === item.href ? item.activeClass : item.restClass
}

onMounted(() => {
  void cart.load()
})
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-primary-border-strong bg-primary-bg-inverse text-primary-text-inverse"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
      <NuxtLink
        to="/"
        aria-label="Retour à l’accueil"
        class="flex items-center gap-3 rounded-md focus-visible:ring-2 focus-visible:ring-secondary-border-default focus-visible:ring-offset-2 focus-visible:ring-offset-primary-bg-inverse focus-visible:outline-none"
      >
        <div
          class="grid size-11 place-items-center rounded-md bg-secondary-fill-default font-black text-secondary-text-inverse shadow-sm"
        >
          M
        </div>
        <div>
          <p class="txt-label font-black uppercase">Michelin</p>
          <p class="txt-caption text-primary-text-inverse/70">
            {{ $t('catalogue.header.subtitle') }}
          </p>
        </div>
      </NuxtLink>

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

    <nav
      aria-label="Outils pneus"
      class="border-b border-neutral-border-subtle bg-neutral-bg-default shadow-sm"
    >
      <div class="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:px-6">
        <span
          class="txt-caption mr-1 hidden shrink-0 font-black text-neutral-text-subtle uppercase sm:inline"
        >
          {{ $t('catalogue.tools.label') }}
        </span>
        <UIButton
          v-for="item in toolItems"
          :key="item.href"
          :to="item.href"
          :text="$t(item.labelKey)"
          :leading-icon="item.icon"
          :aria-current="route.path === item.href ? 'page' : undefined"
          intent="neutral"
          variant="subtle"
          size="sm"
          :class="['h-9 shrink-0 border transition-all duration-150', getToolClass(item)]"
        />
      </div>
    </nav>
  </header>
</template>
