<script setup lang="ts">
import type { CommunityChallenge, CommunityPost, CommunityPostType } from '~/types/community'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'

const props = defineProps<{
  challenges: CommunityChallenge[]
}>()

const emit = defineEmits<{
  created: [post: CommunityPost]
}>()

const auth = useAuthStore()
const route = useRoute()
const community = useCommunity()

const typeSelection = ref<string[]>(['opinion'])
const challengeSelection = ref<string[]>([])
const title = ref('')
const body = ref('')
const selectedFile = ref<File | null>(null)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const typeItems: SelectItem[] = [
  { label: 'Avis', value: 'opinion' },
  { label: 'Test terrain', value: 'test' },
  { label: 'Photo', value: 'photo' },
  { label: 'Video', value: 'video' },
  { label: 'Challenge', value: 'challenge' },
]

const challengeItems = computed<SelectItem[]>(() =>
  props.challenges.map((challenge) => ({
    label: challenge.title,
    value: String(challenge.id),
  })),
)
const selectedType = computed(() => (typeSelection.value[0] ?? 'opinion') as CommunityPostType)
const loginTarget = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)
const canSubmit = computed(
  () =>
    title.value.trim().length >= 3 &&
    body.value.trim().length >= 3 &&
    (selectedType.value !== 'challenge' || challengeSelection.value[0] !== undefined),
)

function onFileChange(event: Event) {
  const input = event.target
  selectedFile.value = input instanceof HTMLInputElement ? (input.files?.[0] ?? null) : null
}

function resetForm() {
  title.value = ''
  body.value = ''
  selectedFile.value = null
  challengeSelection.value = []
}

async function submitPost() {
  if (!canSubmit.value) {
    errorMessage.value =
      selectedType.value === 'challenge' && challengeSelection.value[0] === undefined
        ? 'Choisissez un challenge avant de publier.'
        : 'Le titre et le message doivent contenir au moins 3 caractères.'
    return
  }

  submitting.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const mediaUrl = selectedFile.value
      ? await community.uploadMedia(selectedFile.value)
      : undefined
    const challengeId =
      selectedType.value === 'challenge' && challengeSelection.value[0] !== undefined
        ? Number(challengeSelection.value[0])
        : undefined

    const post = await community.createPost({
      body: body.value,
      challengeId,
      mediaUrl,
      title: title.value,
      type: selectedType.value,
    })

    emit('created', post)
    successMessage.value = 'Publication ajoutee au Riders Club.'
    resetForm()
  } catch (error) {
    errorMessage.value = community.errorMessage.value || useApi().getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UICard
    intent="neutral"
    variant="default"
    :card-base-ui="{ root: 'rounded-md border-neutral-border-subtle bg-neutral-surface-default' }"
  >
    <div class="p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="txt-brand text-primary-text-default">Riders Club</p>
          <h2 class="txt-h4 mt-1 font-black">Partager une sortie</h2>
        </div>
        <UIBadge label="Communauté" intent="secondary" size="sm" variant="subtle" />
      </div>

      <div v-if="!auth.isAuthenticated" class="mt-5">
        <UIAlert
          intent="info"
          title="Connexion requise"
          description="Connectez-vous pour publier un retour terrain, une photo ou un challenge."
        />
        <UIButton
          class="mt-3"
          :to="loginTarget"
          text="Se connecter"
          intent="primary"
          leading-icon="tabler:user"
        />
      </div>

      <form v-else class="mt-5 space-y-4" @submit.prevent="submitPost">
        <UIFormSelect
          v-model="typeSelection"
          :items="typeItems"
          label="Type de publication"
          :show-clear="false"
        />
        <UIFormInput
          v-model="title"
          label="Titre"
          placeholder="Ex. sortie gravel sous la pluie"
          maxlength="140"
          required
        />
        <UIFormTextarea
          v-model="body"
          label="Message"
          placeholder="Partagez le contexte, les sensations, le matériel utilise..."
          :rows="5"
          maxlength="3000"
          required
        />
        <UIFormSelect
          v-if="selectedType === 'challenge'"
          v-model="challengeSelection"
          :items="challengeItems"
          label="Challenge associe"
          placeholder="Choisir un challenge"
          :show-clear="false"
        />

        <UIFormField label="Media" helper-text="Images JPG, PNG, WebP ou video MP4, 8 Mo maximum.">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,video/mp4"
            class="txt-sm w-full rounded-md border border-neutral-border-subtle bg-neutral-surface-default px-3 py-2 text-neutral-text-default file:mr-3 file:rounded-md file:border-0 file:bg-primary-fill-default file:px-3 file:py-1.5 file:text-primary-text-inverse"
            @change="onFileChange"
          />
        </UIFormField>

        <div class="flex flex-wrap items-center gap-3">
          <UIButton
            type="submit"
            text="Publier"
            intent="primary"
            leading-icon="tabler:send"
            :disabled="submitting || !canSubmit"
            :state="submitting ? 'loading' : 'default'"
          />
          <UIButton
            type="button"
            text="Reinitialiser"
            intent="neutral"
            variant="ghost"
            :disabled="submitting"
            @click="resetForm"
          />
        </div>

        <UIAlert
          v-if="errorMessage"
          intent="error"
          title="Publication impossible"
          :description="errorMessage"
        />
        <UIAlert v-if="successMessage" intent="success" :title="successMessage" />
      </form>
    </div>
  </UICard>
</template>
