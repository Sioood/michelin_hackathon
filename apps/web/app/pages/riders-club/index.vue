<script setup lang="ts">
import type { CommunityPost, CommunityPostType } from '~/types/community'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

useHead({
  title: 'Riders Club Michelin',
})

const community = useCommunity()
const typeSelection = ref<string[]>(['all'])
const actionMessage = ref('')
const actionError = ref('')
const actionPending = ref(false)

const typeItems: SelectItem[] = [
  { label: 'Tous', value: 'all' },
  { label: 'Avis', value: 'opinion' },
  { label: 'Tests', value: 'test' },
  { label: 'Photos', value: 'photo' },
  { label: 'Videos', value: 'video' },
  { label: 'Challenges', value: 'challenge' },
]

const selectedType = computed(() => (typeSelection.value[0] ?? 'all') as CommunityPostType | 'all')
const hasMore = computed(() => community.page.value < community.pageCount.value)

async function refreshFeed() {
  await community.loadFeed({ type: selectedType.value })
}

async function onPostCreated() {
  actionMessage.value = 'Publication en ligne.'
  actionError.value = ''
  await refreshFeed()
}

async function reportPost(post: CommunityPost, reason: string) {
  actionPending.value = true
  actionError.value = ''
  actionMessage.value = ''

  try {
    const updated = await community.reportPost(post.id, reason)
    if (updated.hidden) {
      community.removePost(post.id)
    }
    actionMessage.value = 'Signalement pris en compte.'
  } catch (error) {
    actionError.value = useApi().getErrorMessage(error)
  } finally {
    actionPending.value = false
  }
}

async function hidePost(post: CommunityPost) {
  actionPending.value = true
  actionError.value = ''
  actionMessage.value = ''

  try {
    await community.hidePost(post.id)
    community.removePost(post.id)
    actionMessage.value = 'Publication masquee.'
  } catch (error) {
    actionError.value = useApi().getErrorMessage(error)
  } finally {
    actionPending.value = false
  }
}

async function joinChallenge(challengeId: number, score: number, note?: string) {
  actionPending.value = true
  actionError.value = ''
  actionMessage.value = ''

  try {
    await community.joinChallenge(challengeId, score, note)
    actionMessage.value = 'Score enregistre.'
  } catch (error) {
    actionError.value = useApi().getErrorMessage(error)
  } finally {
    actionPending.value = false
  }
}

async function loadInitialData() {
  await Promise.all([community.loadFeed(), community.loadChallenges()])
  await Promise.all(
    community.challenges.value.map((challenge) => community.loadLeaderboard(challenge.id)),
  )
}

watch(typeSelection, () => {
  void refreshFeed()
})

onMounted(() => {
  void loadInitialData()
})
</script>

<template>
  <main class="min-h-svh overflow-x-hidden bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div class="min-w-0">
          <UIBadge label="Beta communautaire" intent="primary" size="sm" />
          <h1 class="txt-h1 mt-4 font-black">Riders Club Michelin</h1>
          <p class="txt-lg mt-3 max-w-3xl text-neutral-text-subtle">
            Retours terrain, photos de sorties, tests pneus et challenges entre cyclistes.
          </p>
        </div>

        <UIFormSelect
          v-model="typeSelection"
          class="w-full shrink-0 sm:w-60"
          :items="typeItems"
          label="Filtrer"
          :show-clear="false"
        />
      </div>

      <div class="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <div class="min-w-0 space-y-6">
          <CommunityCreatePostForm
            :challenges="community.challenges.value"
            @created="onPostCreated"
          />

          <UIAlert
            v-if="actionError"
            intent="error"
            title="Action impossible"
            :description="actionError"
          />
          <UIAlert v-if="actionMessage" intent="success" :title="actionMessage" />
          <UIAlert
            v-if="community.errorMessage.value"
            intent="error"
            title="Flux indisponible"
            :description="community.errorMessage.value"
          />

          <UIProgress
            v-if="community.pending.value && community.posts.value.length === 0"
            intent="primary"
            label="Chargement du Riders Club..."
          />

          <div
            v-else-if="community.posts.value.length === 0"
            class="rounded-md bg-neutral-bg-subtle p-8 text-center"
          >
            <Icon name="tabler:message-circle" class="mx-auto size-10 text-neutral-text-subtle" />
            <h2 class="txt-h4 mt-4 font-black">Aucune publication</h2>
            <p class="txt-base mt-2 text-neutral-text-subtle">
              Le filtre actuel ne contient pas encore de retour rider.
            </p>
          </div>

          <div v-else class="space-y-4">
            <CommunityPostCard
              v-for="post in community.posts.value"
              :key="post.id"
              :post="post"
              @hide="hidePost"
              @report="reportPost"
            />
          </div>

          <div v-if="hasMore" class="flex justify-center pt-2">
            <UIButton
              type="button"
              text="Charger plus"
              intent="primary"
              variant="subtle"
              leading-icon="tabler:chevron-down"
              :disabled="community.pending.value || actionPending"
              :state="community.pending.value ? 'loading' : 'default'"
              @click="community.loadMore"
            />
          </div>
        </div>

        <aside class="min-w-0 xl:sticky xl:top-24">
          <CommunityChallengeBoard
            :challenges="community.challenges.value"
            :leaderboards="community.leaderboards.value"
            :pending="actionPending"
            @join="joinChallenge"
            @refresh="community.loadLeaderboard"
          />
        </aside>
      </div>
    </section>
  </main>
</template>
