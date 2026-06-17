<script setup lang="ts">
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

defineProps<{
  diameterItems: SelectItem[]
  filteredCount: number
  useItems: SelectItem[]
}>()

const search = defineModel<string>('search', { required: true })
const selectedUse = defineModel<string[]>('selectedUse', { required: true })
const selectedDiameter = defineModel<string[]>('selectedDiameter', { required: true })

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <UICard
    title="Recherche"
    subtitle="Filtres"
    intent="neutral"
    variant="default"
    size="md"
    leading-icon="tabler:adjustments-horizontal"
    :card-base-ui="{
      root: 'rounded-md border-neutral-border-subtle bg-neutral-surface-default',
      body: 'p-5',
    }"
    :ui="{
      bodyTitle: 'txt-h5 font-black text-neutral-text-strong',
      content: 'gap-5',
    }"
  >
    <template #header>
      <div class="flex items-center justify-between p-4">
        <span class="txt-caption font-black text-neutral-text-subtle uppercase">Catalogue</span>
        <UIButton
          type="button"
          text="Réinitialiser"
          variant="ghost"
          intent="primary"
          size="sm"
          @click="emit('reset')"
        />
      </div>
    </template>

    <UIFormField label="Mot clé" size="md">
      <UIFormSearchInput
        v-model="search"
        :debounce="100"
        placeholder="Power Cup, gravel, 700..."
        size="md"
        intent="primary"
      />
    </UIFormField>

    <UIFormSelect
      v-model="selectedUse"
      label="Usage"
      :items="useItems"
      size="md"
      intent="primary"
      :show-clear="false"
    />

    <UIFormSelect
      v-model="selectedDiameter"
      label="Diamètre"
      :items="diameterItems"
      size="md"
      intent="primary"
      :show-clear="false"
    />

    <UIDivider intent="neutral" size="sm" />

    <div>
      <p class="txt-h3 font-black">{{ filteredCount }}</p>
      <p class="txt-base text-neutral-text-subtle">références correspondent aux filtres actifs</p>
    </div>
  </UICard>
</template>
