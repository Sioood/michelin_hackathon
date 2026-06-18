<script setup lang="ts">
import { z } from 'zod'

import type { SchemaFieldsMap, SchemaFormLayout } from '~ui/app/utils/Components/Form/schema'

import UIFormInput from '~ui/app/components/Form/Input.vue'

const { t } = useI18n()

const schema = z.object({
  email: z.email(t('auth.validation.invalidEmail')),
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(8, t('auth.validation.passwordMin')),
})

type RegisterValues = z.infer<typeof schema>

const fields: SchemaFieldsMap<RegisterValues> = {
  email: {
    as: UIFormInput,
    props: {
      label: t('auth.fields.email'),
      placeholder: t('auth.fields.emailPlaceholder'),
      type: 'email',
    },
  },
  firstName: {
    as: UIFormInput,
    props: {
      label: t('auth.fields.firstName'),
      placeholder: t('auth.fields.firstNamePlaceholder'),
    },
  },
  lastName: {
    as: UIFormInput,
    props: {
      label: t('auth.fields.lastName'),
      placeholder: t('auth.fields.lastNamePlaceholder'),
    },
  },
  password: {
    as: UIFormInput,
    props: {
      label: t('auth.fields.password'),
      placeholder: t('auth.fields.passwordPlaceholder'),
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

const referralCode = computed(() => {
  const value = route.query.ref
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
})

const redirectTo = computed(() => {
  const { redirect } = route.query
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
})

const loginLink = computed(() => `/login?redirect=${encodeURIComponent(redirectTo.value)}`)

const registerCopy = computed(() => {
  if (redirectTo.value.startsWith('/garage')) {
    return {
      description: t('auth.register.garageDescription'),
      title: t('auth.register.garageTitle'),
    }
  }

  if (redirectTo.value.startsWith('/checkout')) {
    return {
      description: t('auth.register.checkoutDescription'),
      title: t('auth.register.checkoutTitle'),
    }
  }

  return {
    description: t('auth.register.defaultDescription'),
    title: t('auth.register.defaultTitle'),
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
      referralCode: referralCode.value,
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
        <UIBadge :label="$t('auth.register.badge')" intent="secondary" size="sm" />
        <h1 class="txt-h1 mt-4 max-w-3xl font-black">{{ registerCopy.title }}</h1>
        <p class="txt-lg mt-4 max-w-2xl text-neutral-text-subtle">
          {{ registerCopy.description }}
        </p>
      </div>

      <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <h2 class="txt-h4 font-black">{{ $t('auth.register.formTitle') }}</h2>
        <p class="txt-base mt-2 text-neutral-text-subtle">
          {{ $t('auth.register.formDescription') }}
        </p>

        <UIAlert
          v-if="referralCode"
          class="mt-5"
          intent="success"
          :title="$t('loyalty.register.referralTitle')"
          :description="$t('loyalty.register.referralDescription', { code: referralCode })"
        />

        <UIAlert
          v-if="errorMessage"
          class="mt-5"
          intent="error"
          :title="$t('auth.register.errorTitle')"
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
              :text="$t('auth.register.submit')"
              intent="primary"
              size="lg"
              :disabled="!canSubmit || isSubmitting"
              :state="isSubmitting ? 'loading' : 'default'"
            />
          </template>
        </UIForm>

        <p class="txt-base mt-5 text-neutral-text-subtle">
          {{ $t('auth.register.alreadyRegistered') }}
          <UILink :to="loginLink" intent="primary" variant="ghost">
            {{ $t('common.signIn') }}
          </UILink>
        </p>
      </UICard>
    </section>
  </main>
</template>
