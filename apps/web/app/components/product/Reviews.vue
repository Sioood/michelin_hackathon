<script setup lang="ts">
import { z } from 'zod'

import type { Review } from '~/types/product'

const props = defineProps<{ productId: number }>()

const api = useApi()
const auth = useAuthStore()
const { t } = useI18n()

const reviews = ref<Review[]>([])
const loading = ref(true)
const loadError = ref('')
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')
const editingReviewId = ref<number | null>(null)

const ratingValue = ref(5)
const titleValue = ref('')
const bodyValue = ref('')

const reviewSchema = z.object({
  body: z.string().max(2000).optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(160).optional(),
})

const averageRating = computed(() => {
  if (reviews.value.length === 0) return null
  const sum = reviews.value.reduce((accumulator, review) => accumulator + review.rating, 0)
  return sum / reviews.value.length
})

const currentUserReview = computed(
  () =>
    reviews.value.find(
      (review) =>
        auth.user?.id !== undefined && review.userId === auth.user.id && review.id !== undefined,
    ) ?? null,
)

async function loadReviews() {
  loading.value = true
  loadError.value = ''
  try {
    reviews.value = await api.request<Review[]>(`/products/${props.productId}/reviews`)
  } catch {
    reviews.value = []
    loadError.value = t('product.reviews.loadError')
  } finally {
    loading.value = false
  }
}

async function submitReview() {
  submitError.value = ''
  submitSuccess.value = ''
  const parsed = reviewSchema.safeParse({
    body: bodyValue.value.trim() || undefined,
    rating: ratingValue.value,
    title: titleValue.value.trim() || undefined,
  })
  if (!parsed.success) {
    submitError.value = parsed.error.issues[0]?.message ?? t('product.reviews.invalidData')
    return
  }

  submitting.value = true
  try {
    const reviewPath =
      editingReviewId.value === null
        ? `/products/${props.productId}/reviews`
        : `/products/${props.productId}/reviews/${editingReviewId.value}`
    const savedReview = await api.request<Review>(reviewPath, {
      body: parsed.data,
      method: editingReviewId.value === null ? 'POST' : 'PATCH',
    })

    if (editingReviewId.value === null) {
      reviews.value.unshift(savedReview)
      submitSuccess.value = t('product.reviews.published')
    } else {
      reviews.value = reviews.value.map((review) =>
        review.id === savedReview.id ? savedReview : review,
      )
      submitSuccess.value = t('product.reviews.updated')
    }

    resetForm()
  } catch (error) {
    submitError.value = api.getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

function editReview(review: Review) {
  if (review.id === undefined) return

  editingReviewId.value = review.id
  ratingValue.value = review.rating
  titleValue.value = review.title ?? ''
  bodyValue.value = review.body ?? ''
  submitError.value = ''
  submitSuccess.value = ''
}

async function deleteReview(review: Review) {
  if (review.id === undefined) return
  if (!globalThis.confirm(t('product.reviews.confirmDelete'))) return

  submitError.value = ''
  submitSuccess.value = ''
  submitting.value = true

  try {
    await api.request(`/products/${props.productId}/reviews/${review.id}`, {
      method: 'DELETE',
    })
    reviews.value = reviews.value.filter((candidate) => candidate.id !== review.id)
    resetForm()
    submitSuccess.value = t('product.reviews.deleted')
  } catch (error) {
    submitError.value = api.getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  editingReviewId.value = null
  ratingValue.value = 5
  titleValue.value = ''
  bodyValue.value = ''
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)

  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(loadReviews)
</script>

<template>
  <section class="mt-12">
    <h2 class="txt-h3 font-black">{{ $t('product.reviews.title') }}</h2>

    <UIProgress
      v-if="loading"
      class="mt-6"
      intent="primary"
      size="sm"
      :label="$t('product.reviews.loading')"
    />

    <div v-else>
      <UIAlert
        v-if="loadError"
        class="mt-4"
        intent="error"
        :title="$t('product.reviews.unavailableTitle')"
        :description="loadError"
      />

      <div v-if="reviews.length > 0" class="mt-4 flex items-center gap-3">
        <UIFormRating :model-value="averageRating ?? 0" :count="5" allow-half read-only />
        <span class="txt-h4 font-black">{{ averageRating?.toFixed(1) }}/5</span>
        <span class="txt-caption text-neutral-text-subtle">
          ({{ $t('product.reviews.count', { count: reviews.length }) }})
        </span>
      </div>
      <p v-else-if="!loadError" class="txt-base mt-4 text-neutral-text-subtle">
        {{ $t('product.reviews.empty') }}
      </p>

      <div class="mt-6 space-y-4">
        <UICard
          v-for="review in reviews"
          :key="review.id"
          intent="neutral"
          variant="subtle"
          :card-base-ui="{ body: 'rounded-md p-5' }"
        >
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <UIFormRating :model-value="review.rating" :count="5" read-only size="sm" />
              <p v-if="review.title" class="txt-label mt-2 font-black">{{ review.title }}</p>
              <p v-if="review.body" class="txt-base mt-1 text-neutral-text-subtle">
                {{ review.body }}
              </p>
            </div>
            <div class="shrink-0 text-right">
              <p class="txt-label font-bold">{{ review.userDisplayName }}</p>
              <p class="txt-caption text-neutral-text-subtle">{{ formatDate(review.createdAt) }}</p>
              <div
                v-if="auth.user?.id !== undefined && review.userId === auth.user.id"
                class="mt-3 flex justify-end gap-2"
              >
                <UIButton
                  type="button"
                  :text="$t('product.reviews.edit')"
                  intent="neutral"
                  variant="ghost"
                  size="sm"
                  leading-icon="tabler:pencil"
                  :disabled="submitting"
                  @click="editReview(review)"
                />
                <UIButton
                  type="button"
                  :text="$t('product.reviews.delete')"
                  intent="error"
                  variant="ghost"
                  size="sm"
                  leading-icon="tabler:trash"
                  :disabled="submitting"
                  @click="deleteReview(review)"
                />
              </div>
            </div>
          </div>
        </UICard>
      </div>

      <div v-if="auth.isAuthenticated" class="mt-10">
        <h3 class="txt-h4 font-black">
          {{
            editingReviewId === null ? $t('product.reviews.leave') : $t('product.reviews.editMine')
          }}
        </h3>

        <form
          v-if="currentUserReview === null || editingReviewId !== null"
          class="mt-4 space-y-4"
          @submit.prevent="submitReview"
        >
          <div>
            <p class="txt-label mb-2 font-bold">{{ $t('product.reviews.rating') }}</p>
            <UIFormRating
              v-model="ratingValue"
              :count="5"
              :label="$t('product.reviews.yourRating')"
            />
          </div>

          <UIFormInput
            v-model="titleValue"
            :label="$t('product.reviews.titleLabel')"
            :placeholder="$t('product.reviews.titlePlaceholder')"
            maxlength="160"
          />

          <UIFormTextarea
            v-model="bodyValue"
            :label="$t('product.reviews.commentLabel')"
            :placeholder="$t('product.reviews.commentPlaceholder')"
            :rows="4"
            maxlength="2000"
          />

          <UIButton
            type="submit"
            :text="
              editingReviewId === null ? $t('product.reviews.publish') : $t('product.reviews.save')
            "
            intent="primary"
            leading-icon="tabler:message-plus"
            :loading="submitting"
          />
          <UIButton
            v-if="editingReviewId !== null"
            type="button"
            :text="$t('common.cancel')"
            intent="neutral"
            variant="ghost"
            :disabled="submitting"
            @click="resetForm"
          />
        </form>
        <UIAlert
          v-else
          class="mt-4"
          intent="info"
          :title="$t('product.reviews.alreadyTitle')"
          :description="$t('product.reviews.alreadyDescription')"
        />
        <UIAlert v-if="submitError" class="mt-4" intent="error" :title="submitError" />
        <UIAlert v-if="submitSuccess" class="mt-4" intent="success" :title="submitSuccess" />
      </div>
      <div v-else class="mt-8">
        <UIAlert
          intent="info"
          :title="$t('product.reviews.loginTitle')"
          :description="$t('product.reviews.loginDescription')"
        />
        <UIButton
          class="mt-3"
          :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
          :text="$t('common.signIn')"
          intent="primary"
          size="sm"
        />
      </div>
    </div>
  </section>
</template>
