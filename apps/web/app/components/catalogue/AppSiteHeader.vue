<script setup lang="ts">
import type { MenuListEntry } from '~ui/app/components/Menu/index.vue'

const { t } = useI18n()
const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const loyalty = useLoyalty()

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

const navMenuItems = computed<MenuListEntry[]>(() =>
  navItems.map((item) => ({
    label: t(item.labelKey),
    to: item.href,
    type: 'item' as const,
    value: item.href,
  })),
)

const accountMenuItems = computed<MenuListEntry[]>(() => {
  const items: MenuListEntry[] = [
    {
      label: t('catalogue.header.findTyre'),
      to: '/trouver-mon-pneu',
      type: 'item',
      value: 'find-tyre',
    },
    {
      label: t('catalogue.nav.garage'),
      to: '/garage',
      type: 'item',
      value: 'garage',
    },
  ]

  if (auth.isAuthenticated) {
    items.push(
      { type: 'separator' },
      {
        label: t('loyalty.header.points', { count: loyalty.balance.value }),
        to: '/account/loyalty',
        type: 'item',
        value: 'loyalty',
      },
      {
        label: auth.displayName,
        to: '/account/orders',
        type: 'item',
        value: 'account',
      },
    )
  } else {
    items.push(
      { type: 'separator' },
      {
        label: t('catalogue.header.login'),
        to: '/login',
        type: 'item',
        value: 'login',
      },
    )
  }

  return items
})

onMounted(() => {
  void cart.load()
  if (auth.isAuthenticated) {
    void loyalty.loadOverview()
  }
})

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      void loyalty.loadOverview()
      return
    }

    loyalty.clear()
  },
)
</script>

<template>
  <header
    class="sticky top-0 z-30 border-b border-primary-border-strong bg-primary-bg-inverse text-primary-text-inverse"
  >
    <div class="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-3 no-underline">
        <div class="rounded-md bg-neutral-surface-default px-2 py-1">
          <NuxtImg
            src="/images/michelin-logo.png"
            alt="Michelin"
            class="h-7 w-auto shrink-0 object-contain sm:h-8"
            width="140"
            height="79"
            loading="eager"
          />
        </div>
        <div class="hidden min-w-0 lg:block">
          <p class="txt-caption whitespace-nowrap text-primary-text-inverse/70">
            {{ $t('catalogue.header.subtitle') }}
          </p>
        </div>
      </NuxtLink>

      <nav class="hidden items-center gap-4 whitespace-nowrap xl:flex">
        <UILink
          v-for="item in navItems"
          :key="item.href"
          :to="item.href"
          intent="neutral"
          variant="ghost"
          :ui="{
            root: 'txt-label shrink-0 whitespace-nowrap font-semibold text-primary-text-inverse/80 hover:text-primary-text-inverse',
          }"
        >
          {{ $t(item.labelKey) }}
        </UILink>
      </nav>

      <div class="min-w-0 flex-1" />

      <SearchAiSearchBar compact class="hidden max-w-52 shrink-0 2xl:flex" />

      <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <UIButton
          :text="$t('catalogue.header.findTyre')"
          intent="secondary"
          size="sm"
          leading-icon="tabler:circle-filled"
          to="/trouver-mon-pneu"
          class="hidden whitespace-nowrap 2xl:inline-flex"
          :ui="secondaryButtonUi"
        />
        <UIButton
          icon="tabler:circle-filled"
          :aria-label="$t('catalogue.header.findTyre')"
          intent="secondary"
          size="sm"
          to="/trouver-mon-pneu"
          class="inline-flex xl:hidden"
          :ui="secondaryButtonUi"
        />

        <UIButton
          v-if="auth.isAuthenticated"
          :text="$t('loyalty.header.points', { count: loyalty.balance.value })"
          intent="secondary"
          variant="subtle"
          size="sm"
          leading-icon="tabler:stars"
          to="/account/loyalty"
          class="hidden whitespace-nowrap xl:inline-flex"
          :ui="secondaryButtonUi"
        />

        <UIMenu
          intent="primary"
          :items="accountMenuItems"
          :show-indicator="false"
          unstyled
          :ui="{ content: 'min-w-48' }"
        >
          <template #trigger>
            <UIButton
              icon="tabler:user"
              :aria-label="auth.isAuthenticated ? auth.displayName : $t('catalogue.header.login')"
              intent="primary"
              variant="ghost"
              size="sm"
              :ui="{ root: 'text-primary-text-inverse hover:text-primary-text-inverse' }"
            />
          </template>
        </UIMenu>

        <UIMenu
          intent="neutral"
          :items="navMenuItems"
          :show-indicator="false"
          class="xl:hidden"
          unstyled
        >
          <template #trigger>
            <UIButton
              icon="tabler:menu-2"
              aria-label="Menu navigation"
              intent="secondary"
              variant="subtle"
              size="sm"
              :ui="secondaryButtonUi"
            />
          </template>
        </UIMenu>

        <div class="relative shrink-0">
          <UIButton
            type="button"
            icon="tabler:shopping-cart"
            aria-label="Ouvrir le panier"
            intent="secondary"
            variant="subtle"
            size="sm"
            :ui="secondaryButtonUi"
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
