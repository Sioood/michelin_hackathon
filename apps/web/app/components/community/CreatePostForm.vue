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
const { t } = useI18n()

const typeSelection = ref<string[]>(['opinion'])
const challengeSelection = ref<string[]>([])
const title = ref('')
const body = ref('')
const selectedFile = ref<File | null>(null)
const submitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const typeItems = computed<SelectItem[]>(() => [
  { label: t('community.postTypes.opinion'), value: 'opinion' },
  { label: t('community.postTypes.test'), value: 'test' },
  { label: t('community.postTypes.photo'), value: 'photo' },
  { label: t('community.postTypes.video'), value: 'video' },
  { label: t('community.postTypes.challenge'), value: 'challenge' },
])

const challengeItems = computed<SelectItem[]>(() =>
  props.challenges.map((challenge) => ({
    label: challenge.title,
    value: String(challenge.id),
  })),
)
const selectedType = computed(() => (typeSelection.value[0] ?? 'opinion') as CommunityPostType)
const loginTarget = computed(() => `/login?redirect=${encodeURIComponent(route.fullPath)}`)

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
    successMessage.value = t('community.create.success')
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
          <p class="txt-brand text-primary-text-default">{{ $t('community.create.eyebrow') }}</p>
          <h2 class="txt-h4 mt-1 font-black">{{ $t('community.create.title') }}</h2>
        </div>
        <UIBadge
          :label="$t('community.create.badge')"
          intent="secondary"
          size="sm"
          variant="subtle"
        />
      </div>

      <div v-if="!auth.isAuthenticated" class="mt-5">
        <UIAlert
          intent="info"
          :title="$t('community.create.loginTitle')"
          :description="$t('community.create.loginDescription')"
        />
        <UIButton
          class="mt-3"
          :to="loginTarget"
          :text="$t('community.create.login')"
          intent="primary"
          leading-icon="tabler:user"
        />
      </div>

      <form v-else class="mt-5 space-y-4" @submit.prevent="submitPost">
        <UIFormSelect
          v-model="typeSelection"
          :items="typeItems"
          :label="$t('community.create.type')"
          :show-clear="false"
        />
        <UIFormInput
          v-model="title"
          :label="$t('community.create.titleLabel')"
          :placeholder="$t('community.create.titlePlaceholder')"
          maxlength="140"
          required
        />
        <UIFormTextarea
          v-model="body"
          :label="$t('community.create.message')"
          :placeholder="$t('community.create.messagePlaceholder')"
          :rows="5"
          maxlength="3000"
          required
        />
        <UIFormSelect
          v-if="selectedType === 'challenge'"
          v-model="challengeSelection"
          :items="challengeItems"
          :label="$t('community.create.challenge')"
          :placeholder="$t('community.create.challengePlaceholder')"
          :show-clear="false"
        />

        <UIFormField
          :label="$t('community.create.media')"
          :helper-text="$t('community.create.mediaHelp')"
        >
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
            :text="$t('community.create.publish')"
            intent="primary"
            leading-icon="tabler:send"
            :disabled="submitting"
            :state="submitting ? 'loading' : 'default'"
          />
          <UIButton
            type="button"
            :text="$t('community.create.reset')"
            intent="neutral"
            variant="ghost"
            :disabled="submitting"
            @click="resetForm"
          />
        </div>

        <UIAlert
          v-if="errorMessage"
          intent="error"
          :title="$t('community.create.errorTitle')"
          :description="errorMessage"
        />
        <UIAlert v-if="successMessage" intent="success" :title="successMessage" />
      </form>
    </div>
  </UICard>
</template>
