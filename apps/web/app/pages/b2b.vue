<script setup lang="ts">
useHead({
  title: 'Espace revendeur Michelin',
})
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section
      class="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_28rem] lg:items-center"
    >
      <div class="min-w-0">
        <UIBadge label="B2B" intent="primary" size="sm" />
        <h1 class="txt-h1 mt-4 font-black">Espace revendeur Michelin</h1>
        <p class="txt-lg mt-4 max-w-3xl text-neutral-text-subtle">
          Un accès dédié aux distributeurs arrive bientôt : disponibilité réseau, conditions
          commerciales, commandes groupées et supports magasin.
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
          <UIButton
            to="/"
            text="Retour au catalogue"
            intent="primary"
            leading-icon="tabler:arrow-left"
          />
          <UIButton to="/admin" text="Vue admin démo" intent="neutral" variant="subtle" />
        </div>
      </div>

      <div class="rounded-md border border-neutral-border-subtle bg-neutral-surface-default p-6">
        <h2 class="txt-h4 font-black">Bientôt disponible</h2>
        <div class="mt-5 space-y-4">
          <div class="flex items-start gap-3">
            <Icon name="tabler:building-store" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">
              Catalogue revendeur et stocks par dépôt.
            </p>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="tabler:truck-delivery" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">Commandes groupées et suivi logistique.</p>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="tabler:chart-bar" class="mt-1 size-5 text-primary-text-default" />
            <p class="txt-base text-neutral-text-subtle">
              Indicateurs sell-in / sell-out pour piloter les assortiments.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
