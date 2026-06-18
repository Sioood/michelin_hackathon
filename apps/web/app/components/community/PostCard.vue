<script setup lang="ts">
import type { CommunityPost, CommunityPostType } from '~/types/community'

const props = defineProps<{
  post: CommunityPost
}>()

const emit = defineEmits<{
  hide: [post: CommunityPost]
  report: [post: CommunityPost, reason: string]
}>()

const auth = useAuthStore()
const community = useCommunity()
const { t } = useI18n()

const typeLabels = computed<Record<CommunityPostType, string>>(() => ({
  challenge: t('community.postTypes.challenge'),
  opinion: t('community.postTypes.opinion'),
  photo: t('community.postTypes.photo'),
  test: t('community.postTypes.test'),
  video: t('community.postTypes.video'),
}))

const createdAt = computed(() =>
  new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(props.post.createdAt)),
)
const mediaUrl = computed(() => community.resolveMediaUrl(props.post.mediaUrl))
const isVideo = computed(
  () => props.post.type === 'video' || mediaUrl.value?.endsWith('.mp4') === true,
)
const isAuthor = computed(() => auth.user?.id === props.post.userId)

function askReportReason() {
  const reason = globalThis.prompt?.(t('community.card.reportReason'))?.trim()

  if (reason !== undefined && reason.length >= 3) {
    emit('report', props.post, reason)
  }
}
</script>

<template>
  <UICard
    intent="neutral"
    variant="default"
    :card-base-ui="{ root: 'rounded-md border-neutral-border-subtle bg-neutral-surface-default' }"
  >
    <div class="space-y-4 p-5">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <UIBadge :label="typeLabels[post.type]" intent="primary" size="sm" variant="subtle" />
            <span class="txt-caption text-neutral-text-subtle">{{ createdAt }}</span>
          </div>
          <h3 class="txt-h4 mt-2 font-black text-neutral-text-strong">
            {{ post.title }}
          </h3>
          <p class="txt-sm mt-1 text-neutral-text-subtle">
            {{ $t('community.card.by', { name: post.userDisplayName }) }}
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <UIButton
            v-if="isAuthor"
            type="button"
            icon="tabler:eye-off"
            :aria-label="$t('community.card.hide')"
            intent="neutral"
            variant="ghost"
            size="sm"
            @click="emit('hide', post)"
          />
          <UIButton
            v-else-if="auth.isAuthenticated"
            type="button"
            icon="tabler:flag"
            :aria-label="$t('community.card.report')"
            intent="neutral"
            variant="ghost"
            size="sm"
            @click="askReportReason"
          />
        </div>
      </div>

      <p class="txt-base whitespace-pre-line text-neutral-text-default">{{ post.body }}</p>

      <div v-if="mediaUrl" class="overflow-hidden rounded-md border border-neutral-border-subtle">
        <video
          v-if="isVideo"
          :src="mediaUrl"
          controls
          class="max-h-[28rem] w-full bg-neutral-bg-inverse object-contain"
        />
        <img
          v-else
          :src="mediaUrl"
          :alt="post.title"
          class="max-h-[28rem] w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  </UICard>
</template>
