<script setup lang="ts">
import type { AiSearchResponse } from '~/types/search'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    pending?: boolean
    redirectOnSearch?: boolean
    response?: AiSearchResponse | null
    stacked?: boolean
  }>(),
  {
    compact: false,
    pending: false,
    redirectOnSearch: false,
    response: null,
    stacked: false,
  },
)

const emit = defineEmits<{
  search: [query: string]
}>()

const query = defineModel<string>({ default: '' })
const sourcePresentation = computed(() =>
  props.response === null ? null : getSearchSourcePresentation(props.response.source),
)

function submit() {
  const value = query.value.trim()

  if (value.length === 0) {
    return
  }

  if (props.compact || props.redirectOnSearch) {
    void navigateTo({ path: '/recherche', query: { q: value } })
    return
  }

  emit('search', value)
}
</script>

<template>
  <form
    class="flex w-full flex-col gap-3"
    :class="compact ? 'max-w-sm' : stacked ? '' : 'max-w-3xl'"
    @submit.prevent="submit"
  >
    <div :class="stacked ? 'flex flex-col gap-2' : 'flex min-w-0 gap-2'">
      <UIFormSearchInput
        v-model="query"
        class="w-full min-w-0 flex-1"
        :debounce="0"
        :placeholder="
          compact ? 'Gravel tubeless...' : 'Ex: pneu gravel tubeless pour vélo électrique en 700'
        "
        size="md"
        intent="primary"
      />
      <UIButton
        type="submit"
        :text="compact ? '' : 'Rechercher'"
        :icon="compact ? 'tabler:sparkles' : undefined"
        :leading-icon="compact ? undefined : 'tabler:sparkles'"
        intent="secondary"
        :aria-label="compact ? 'Recherche IA' : undefined"
        :state="pending ? 'loading' : 'default'"
        :disabled="pending"
        :class="stacked ? 'w-full whitespace-nowrap' : 'shrink-0'"
        :ui="secondaryButtonUi"
      />
    </div>

    <UIAlert
      v-if="response?.explanation && sourcePresentation && !compact"
      :intent="sourcePresentation.intent"
      :title="sourcePresentation.title"
      :description="response.explanation"
      :icon="sourcePresentation.icon"
    />
  </form>
</template>
