<script setup lang="ts">
import type { AiSearchResponse } from '~/types/search'

const props = withDefaults(
  defineProps<{
    compact?: boolean
    pending?: boolean
    redirectOnSearch?: boolean
    response?: AiSearchResponse | null
  }>(),
  {
    compact: false,
    pending: false,
    redirectOnSearch: false,
    response: null,
  },
)

const emit = defineEmits<{
  search: [query: string]
}>()

const query = defineModel<string>({ default: '' })

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
    :class="compact ? 'max-w-sm' : 'max-w-3xl'"
    @submit.prevent="submit"
  >
    <div class="flex min-w-0 gap-2">
      <UIFormSearchInput
        v-model="query"
        class="min-w-0 flex-1"
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
        icon="tabler:sparkles"
        intent="secondary"
        :aria-label="compact ? 'Recherche IA' : undefined"
        :state="pending ? 'loading' : 'default'"
        :disabled="pending"
      />
    </div>

    <UIAlert
      v-if="response?.explanation && !compact"
      intent="info"
      title="Suggestion IA"
      :description="response.explanation"
      icon="tabler:sparkles"
    />
  </form>
</template>
