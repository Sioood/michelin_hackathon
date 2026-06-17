<script setup lang="ts">
const navItems = [
  { href: '#categories', label: 'Pneus vélo' },
  { href: '#catalogue', label: 'Catalogue' },
  { href: '#technologies', label: 'Technologies' },
] as const
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
          <p class="txt-caption text-primary-text-inverse/70">Bicycle catalogue 2026</p>
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
          {{ item.label }}
        </UILink>
      </nav>

      <div class="flex items-center gap-2">
        <UIButton
          text="Choisir le bon pneu"
          intent="secondary"
          size="sm"
          leading-icon="tabler:circle-filled"
          class="hidden sm:inline-flex"
        />
        <UIButton
          text="Revendeur"
          intent="primary"
          variant="ghost"
          size="sm"
          leading-icon="tabler:map-pin"
          class="hidden lg:inline-flex"
        />
      </div>
    </div>
  </header>
</template>
