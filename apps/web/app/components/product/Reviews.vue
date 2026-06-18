<script setup lang="ts">
import { z } from 'zod'

import type { Review } from '~/types/product'

const props = defineProps<{ productId: number }>()

const api = useApi()
const auth = useAuthStore()

const reviews = ref<Review[]>([])
const loading = ref(true)
const submitting = ref(false)
const submitError = ref('')
const submitSuccess = ref('')

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
  const sum = reviews.value.reduce((acc, r) => acc + r.rating, 0)
  return (sum / reviews.value.length).toFixed(1)
})

async function loadReviews() {
  loading.value = true
  try {
    reviews.value = await api.request<Review[]>(`/products/${props.productId}/reviews`)
  } catch {
    reviews.value = []
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
    submitError.value = parsed.error.issues[0]?.message ?? 'Données invalides.'
    return
  }

  submitting.value = true
  try {
    const created = await api.request<Review>(`/products/${props.productId}/reviews`, {
      body: parsed.data,
      method: 'POST',
    })
    reviews.value.unshift(created)
    submitSuccess.value = 'Avis publié !'
    ratingValue.value = 5
    titleValue.value = ''
    bodyValue.value = ''
  } catch (error) {
    submitError.value = api.getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

onMounted(loadReviews)
</script>

<template>
  <section class="mt-12">
    <h2 class="txt-h3 font-black">Avis clients</h2>

    <UIProgress v-if="loading" class="mt-6" intent="primary" size="sm" label="Chargement des avis..." />

    <div v-else>
      <div v-if="reviews.length > 0" class="mt-4 flex items-center gap-3">
        <UIFormRating :model-value="Number(averageRating)" :count="5" read-only />
        <span class="txt-h4 font-black">{{ averageRating }}/5</span>
        <span class="txt-caption text-neutral-text-subtle">
          ({{ reviews.length }} avis)
        </span>
      </div>
      <p v-else class="txt-base mt-4 text-neutral-text-subtle">
        Aucun avis pour le moment. Soyez le premier à donner votre avis !
      </p>

      <div class="mt-6 space-y-4">
        <UICard
          v-for="review in reviews"
          :key="review.id"
          intent="neutral"
          variant="subtle"
          :card-base-ui="{ body: 'rounded-md p-5' }"
        >
          <div class="flex items-start justify-between gap-4">
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
            </div>
          </div>
        </UICard>
      </div>

      <div v-if="auth.isAuthenticated" class="mt-10">
        <h3 class="txt-h4 font-black">Laisser un avis</h3>

        <form class="mt-4 space-y-4" @submit.prevent="submitReview">
          <div>
            <p class="txt-label mb-2 font-bold">Note</p>
            <UIFormRating v-model="ratingValue" :count="5" label="Votre note" />
          </div>

          <UIFormInput
            v-model="titleValue"
            label="Titre (optionnel)"
            placeholder="Résumé de votre expérience"
            maxlength="160"
          />

          <UIFormTextarea
            v-model="bodyValue"
            label="Commentaire (optionnel)"
            placeholder="Partagez votre expérience avec ce pneu..."
            :rows="4"
            maxlength="2000"
          />

          <UIAlert
            v-if="submitError"
            intent="error"
            :title="submitError"
          />
          <UIAlert
            v-if="submitSuccess"
            intent="success"
            :title="submitSuccess"
          />

          <UIButton
            type="submit"
            text="Publier mon avis"
            intent="primary"
            leading-icon="tabler:message-plus"
            :loading="submitting"
          />
        </form>
      </div>
      <div v-else class="mt-8">
        <UIAlert
          intent="info"
          title="Connectez-vous pour laisser un avis"
          description="Vous devez être connecté pour publier un avis sur ce produit."
        />
        <UIButton
          class="mt-3"
          :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
          text="Se connecter"
          intent="primary"
          size="sm"
        />
      </div>
    </div>
  </section>
</template>
