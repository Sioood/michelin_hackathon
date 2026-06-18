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

const { t } = useI18n()
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
    :class="compact ? 'max-w-sm' : stacked ? '' : 'max-w-3xl'"
    @submit.prevent="submit"
  >
    <div :class="stacked ? 'flex flex-col gap-2' : 'flex min-w-0 gap-2'">
      <UIFormSearchInput
        v-model="query"
        class="w-full min-w-0 flex-1"
        :debounce="0"
        :placeholder="compact ? t('search.bar.compactPlaceholder') : t('search.bar.placeholder')"
        size="md"
        intent="primary"
      />
      <UIButton
        type="submit"
        :text="compact ? '' : $t('search.bar.submit')"
        :icon="compact ? 'tabler:sparkles' : undefined"
        :leading-icon="compact ? undefined : 'tabler:sparkles'"
        intent="secondary"
        :aria-label="compact ? $t('search.bar.aria') : undefined"
        :state="pending ? 'loading' : 'default'"
        :disabled="pending"
        :class="stacked ? 'w-full whitespace-nowrap' : 'shrink-0'"
        :ui="secondaryButtonUi"
      />
    </div>

    <UIAlert
      v-if="response?.explanation && !compact"
      intent="info"
      :title="$t('search.bar.suggestionTitle')"
      :description="response.explanation"
      icon="tabler:sparkles"
    />
  </form>
</template>
