<script setup lang="ts">
import type {
  ChallengeLeaderboardEntry,
  CommunityChallenge,
  CommunityChallengeMetric,
} from '~/types/community'

const props = defineProps<{
  challenges: CommunityChallenge[]
  leaderboards: Record<number, ChallengeLeaderboardEntry[]>
  pending?: boolean
}>()

const emit = defineEmits<{
  join: [challengeId: number, score: number, note?: string]
  refresh: [challengeId: number]
}>()

const auth = useAuthStore()
const route = useRoute()
const scores = ref<Record<number, string>>({})
const notes = ref<Record<number, string>>({})

const metricLabels: Record<CommunityChallengeMetric, string> = {
  distance_km: 'km',
  posts: 'publications',
}

const loginTarget = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value))
}

function submitScore(challengeId: number) {
  const score = Number(scores.value[challengeId] ?? 0)

  if (!Number.isFinite(score) || score < 0) {
    return
  }

  emit('join', challengeId, score, notes.value[challengeId])
}
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="txt-brand text-secondary-text-default">Challenges</p>
        <h2 class="txt-h3 mt-1 font-black">Classements riders</h2>
      </div>
      <UIButton
        v-if="!auth.isAuthenticated"
        :to="loginTarget"
        text="Participer"
        intent="secondary"
        leading-icon="tabler:trophy"
      />
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <div
        v-if="challenges.length === 0"
        class="rounded-md border border-neutral-border-subtle bg-neutral-surface-default p-5 text-center lg:col-span-2"
      >
        <Icon name="tabler:trophy-off" class="mx-auto size-8 text-neutral-text-subtle" />
        <p class="txt-sm mt-3 text-neutral-text-subtle">Aucun challenge actif pour le moment.</p>
      </div>

      <UICard
        v-for="challenge in challenges"
        :key="challenge.id"
        intent="neutral"
        variant="default"
        :card-base-ui="{
          root: 'rounded-md border-neutral-border-subtle bg-neutral-surface-default',
        }"
      >
        <div class="space-y-4 p-5">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0">
              <h3 class="txt-h5 font-black">{{ challenge.title }}</h3>
              <p class="txt-sm mt-1 text-neutral-text-subtle">{{ challenge.description }}</p>
            </div>
            <UIBadge
              :label="`${challenge.participantCount} participant${challenge.participantCount > 1 ? 's' : ''}`"
              intent="accent"
              size="sm"
              variant="subtle"
            />
          </div>

          <p class="txt-caption text-neutral-text-subtle">
            Jusqu'au {{ formatDate(challenge.endsAt) }} · score en
            {{ metricLabels[challenge.metric] }}
          </p>

          <div v-if="auth.isAuthenticated" class="grid gap-3 sm:grid-cols-[7rem_1fr_auto]">
            <UIFormInput
              v-model="scores[challenge.id]"
              type="number"
              min="0"
              step="1"
              label="Score"
              placeholder="0"
            />
            <UIFormInput
              v-model="notes[challenge.id]"
              label="Note"
              placeholder="Sortie, velo, conditions..."
              maxlength="180"
            />
            <div class="flex items-end">
              <UIButton
                type="button"
                text="Valider"
                intent="secondary"
                :disabled="pending"
                @click="submitScore(challenge.id)"
              />
            </div>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-3">
              <p class="txt-label font-bold">Top riders</p>
              <UIButton
                type="button"
                icon="tabler:refresh"
                aria-label="Actualiser"
                intent="neutral"
                variant="ghost"
                size="sm"
                @click="emit('refresh', challenge.id)"
              />
            </div>

            <ol class="space-y-2">
              <li
                v-for="entry in props.leaderboards[challenge.id] ?? []"
                :key="entry.id"
                class="flex items-center justify-between gap-3 rounded-md bg-neutral-bg-subtle px-3 py-2"
              >
                <span class="txt-sm min-w-0 truncate">
                  <strong>#{{ entry.rank }}</strong>
                  {{ entry.userDisplayName }}
                </span>
                <span class="txt-label shrink-0 font-black">
                  {{ entry.score }} {{ metricLabels[challenge.metric] }}
                </span>
              </li>
            </ol>

            <p
              v-if="(props.leaderboards[challenge.id] ?? []).length === 0"
              class="txt-sm rounded-md bg-neutral-bg-subtle px-3 py-3 text-neutral-text-subtle"
            >
              Aucun score publie pour le moment.
            </p>
          </div>
        </div>
      </UICard>
    </div>
  </section>
</template>
