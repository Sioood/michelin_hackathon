<script setup lang="ts">
import { z } from 'zod'

import type { SchemaFieldsMap, SchemaFormLayout } from '~ui/app/utils/Components/Form/schema'

import UIFormInput from '~ui/app/components/Form/Input.vue'

const schema = z.object({
  email: z.email('Adresse e-mail invalide'),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

type RegisterValues = z.infer<typeof schema>

const fields: SchemaFieldsMap<RegisterValues> = {
  email: {
    as: UIFormInput,
    props: {
      label: 'Adresse e-mail',
      placeholder: 'marie.dupont@example.com',
      type: 'email',
    },
  },
  firstName: {
    as: UIFormInput,
    props: {
      label: 'Prénom',
      placeholder: 'Marie',
    },
  },
  lastName: {
    as: UIFormInput,
    props: {
      label: 'Nom',
      placeholder: 'Dupont',
    },
  },
  password: {
    as: UIFormInput,
    props: {
      label: 'Mot de passe',
      placeholder: '8 caractères minimum',
      type: 'password',
    },
  },
}

const layout: SchemaFormLayout<keyof RegisterValues & string>[] = [
  ['firstName', 'lastName'],
  'email',
  'password',
]
const defaultValues: RegisterValues = { email: '', firstName: '', lastName: '', password: '' }

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const api = useApi()
const errorMessage = ref('')

const redirectTo = computed(() => {
  const { redirect } = route.query
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
})

const loginLink = computed(() => `/login?redirect=${encodeURIComponent(redirectTo.value)}`)

const registerCopy = computed(() => {
  if (redirectTo.value.startsWith('/garage')) {
    return {
      description:
        'Créez votre espace pour conserver vos vélos, vos pneus montés et vos rappels de remplacement.',
      title: 'Créez votre compte pour ouvrir votre garage.',
    }
  }

  if (redirectTo.value.startsWith('/checkout')) {
    return {
      description:
        'Paiement plus rapide, historique de commandes et panier sauvegardé pour vos prochains pneus.',
      title: 'Créez votre compte et finalisez votre commande.',
    }
  }

  return {
    description:
      'Paiement plus rapide, historique de commandes, panier sauvegardé et garage vélo au même endroit.',
    title: 'Créez votre compte et gardez le contrôle.',
  }
})

async function submit(values: RegisterValues) {
  errorMessage.value = ''

  try {
    await auth.register({
      email: values.email,
      firstName: values.firstName.trim() || undefined,
      lastName: values.lastName.trim() || undefined,
      password: values.password,
    })
    await cart.load()
    await navigateTo(redirectTo.value)
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  }
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_460px]">
      <div class="flex flex-col justify-center">
        <UIBadge label="Nouveau client" intent="secondary" size="sm" />
        <h1 class="txt-h1 mt-4 max-w-3xl font-black">{{ registerCopy.title }}</h1>
        <p class="txt-lg mt-4 max-w-2xl text-neutral-text-subtle">
          {{ registerCopy.description }}
        </p>
      </div>

      <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <h2 class="txt-h4 font-black">Inscription</h2>
        <p class="txt-base mt-2 text-neutral-text-subtle">Quelques informations suffisent.</p>

        <UIAlert
          v-if="errorMessage"
          class="mt-5"
          intent="error"
          title="Inscription impossible"
          :description="errorMessage"
        />

        <UIForm
          class="mt-6"
          :schema="schema"
          :default-values="defaultValues"
          :fields="fields"
          :layout="layout"
          show-error-summary
          @submit="submit"
        >
          <template #actions="{ canSubmit, isSubmitting }">
            <UIButton
              type="submit"
              class="w-full"
              text="Créer mon compte"
              intent="primary"
              size="lg"
              :disabled="!canSubmit || isSubmitting"
              :state="isSubmitting ? 'loading' : 'default'"
            />
          </template>
        </UIForm>

        <p class="txt-base mt-5 text-neutral-text-subtle">
          Déjà inscrit ?
          <UILink :to="loginLink" intent="primary" variant="ghost">Se connecter</UILink>
        </p>
      </UICard>
    </section>
  </main>
</template>
