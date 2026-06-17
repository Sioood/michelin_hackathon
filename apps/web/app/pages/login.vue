<script setup lang="ts">
import { z } from 'zod'

import type { SchemaFieldsMap, SchemaFormLayout } from '~ui/app/utils/Components/Form/schema'

import UIFormInput from '~ui/app/components/Form/Input.vue'

const schema = z.object({
  email: z.email('Adresse e-mail invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
})

type LoginValues = z.infer<typeof schema>

const fields: SchemaFieldsMap<LoginValues> = {
  email: {
    as: UIFormInput,
    props: {
      label: 'Adresse e-mail',
      placeholder: 'marie.dupont@example.com',
      type: 'email',
    },
  },
  password: {
    as: UIFormInput,
    props: {
      label: 'Mot de passe',
      placeholder: '8 caracteres minimum',
      type: 'password',
    },
  },
}

const layout: SchemaFormLayout<keyof LoginValues & string>[] = ['email', 'password']
const defaultValues: LoginValues = { email: '', password: '' }

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const api = useApi()
const errorMessage = ref('')
const successMessage = ref('')

const redirectTo = computed(() => {
  const { redirect } = route.query
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
})

async function submit(values: LoginValues) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await auth.login(values)
    await cart.load()
    successMessage.value = 'Session ouverte.'
    await navigateTo(redirectTo.value)
  } catch (error) {
    errorMessage.value = api.getErrorMessage(error)
  }
}
</script>

<template>
  <main class="min-h-svh bg-neutral-bg-default text-neutral-text-strong">
    <CatalogueAppSiteHeader />

    <section class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_440px]">
      <div class="flex flex-col justify-center">
        <UIBadge label="Compte Michelin" intent="primary" size="sm" />
        <h1 class="txt-h1 mt-4 max-w-3xl font-black">
          Connectez-vous pour finaliser votre commande.
        </h1>
        <p class="txt-lg mt-4 max-w-2xl text-neutral-text-subtle">
          Retrouvez votre panier, lancez le checkout Stripe et suivez vos commandes depuis votre
          espace.
        </p>
      </div>

      <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <h2 class="txt-h4 font-black">Connexion</h2>
        <p class="txt-base mt-2 text-neutral-text-subtle">Accedez a votre espace client.</p>

        <UIAlert
          v-if="errorMessage"
          class="mt-5"
          intent="error"
          title="Connexion impossible"
          :description="errorMessage"
        />
        <UIAlert
          v-if="successMessage"
          class="mt-5"
          intent="success"
          title="Connecte"
          :description="successMessage"
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
              text="Se connecter"
              intent="primary"
              size="lg"
              :disabled="!canSubmit || isSubmitting"
              :state="isSubmitting ? 'loading' : 'default'"
            />
          </template>
        </UIForm>

        <p class="txt-base mt-5 text-neutral-text-subtle">
          Pas encore de compte ?
          <UILink to="/register" intent="primary" variant="ghost">Creer un compte</UILink>
        </p>
      </UICard>
    </section>
  </main>
</template>
