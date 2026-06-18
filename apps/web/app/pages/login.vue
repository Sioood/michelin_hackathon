<script setup lang="ts">
import { z } from 'zod'

import type { SchemaFieldsMap, SchemaFormLayout } from '~ui/app/utils/Components/Form/schema'

import UIFormInput from '~ui/app/components/Form/Input.vue'

const { t } = useI18n()

const schema = z.object({
  email: z.email(t('auth.validation.invalidEmail')),
  password: z.string().min(8, t('auth.validation.passwordMin')),
})

type LoginValues = z.infer<typeof schema>

const fields: SchemaFieldsMap<LoginValues> = {
  email: {
    as: UIFormInput,
    props: {
      label: t('auth.fields.email'),
      placeholder: t('auth.fields.emailPlaceholder'),
      type: 'email',
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

const registerLink = computed(() => `/register?redirect=${encodeURIComponent(redirectTo.value)}`)

const loginCopy = computed(() => {
  if (redirectTo.value.startsWith('/checkout')) {
    return {
      description: t('auth.login.checkoutDescription'),
      title: t('auth.login.checkoutTitle'),
    }
  }

  if (redirectTo.value.startsWith('/garage')) {
    return {
      description: t('auth.login.garageDescription'),
      title: t('auth.login.garageTitle'),
    }
  }

  if (redirectTo.value.startsWith('/account/orders')) {
    return {
      description: t('auth.login.ordersDescription'),
      title: t('auth.login.ordersTitle'),
    }
  }

  return {
    description: t('auth.login.defaultDescription'),
    title: t('auth.login.defaultTitle'),
  }
})

async function submit(values: LoginValues) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await auth.login(values)
    await cart.load()
    successMessage.value = t('auth.login.successDescription')
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
        <UIBadge :label="$t('auth.login.badge')" intent="primary" size="sm" />
        <h1 class="txt-h1 mt-4 max-w-3xl font-black">
          {{ loginCopy.title }}
        </h1>
        <p class="txt-lg mt-4 max-w-2xl text-neutral-text-subtle">
          {{ loginCopy.description }}
        </p>
      </div>

      <UICard intent="neutral" variant="default" :card-base-ui="{ body: 'rounded-md p-6' }">
        <h2 class="txt-h4 font-black">{{ $t('auth.login.formTitle') }}</h2>
        <p class="txt-base mt-2 text-neutral-text-subtle">{{ $t('auth.login.formDescription') }}</p>

        <UIAlert
          v-if="errorMessage"
          class="mt-5"
          intent="error"
          :title="$t('auth.login.errorTitle')"
          :description="errorMessage"
        />
        <UIAlert
          v-if="successMessage"
          class="mt-5"
          intent="success"
          :title="$t('auth.login.successTitle')"
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
              :text="$t('auth.login.submit')"
              intent="primary"
              size="lg"
              :disabled="!canSubmit || isSubmitting"
              :state="isSubmitting ? 'loading' : 'default'"
            />
          </template>
        </UIForm>

        <p class="txt-base mt-5 text-neutral-text-subtle">
          {{ $t('auth.login.noAccount') }}
          <UILink :to="registerLink" intent="primary" variant="ghost">
            {{ $t('auth.login.createAccount') }}
          </UILink>
        </p>
      </UICard>
    </section>
  </main>
</template>
