<script setup lang="ts">
import { z } from 'zod'

import type { SchemaFieldsMap, SchemaFormLayout } from '~ui/app/utils/Components/Form/schema'

import UIFormInput from '~ui/app/components/Form/Input.vue'

const emit = defineEmits<{
  redeemed: [message: string]
}>()

const { t } = useI18n()
const schema = z.object({
  code: z.string().min(4, t('loyalty.redeem.codeTooShort')),
})

type RedeemValues = z.infer<typeof schema>

const fields = computed<SchemaFieldsMap<RedeemValues>>(() => ({
  code: {
    as: UIFormInput,
    props: {
      label: t('loyalty.redeem.codeLabel'),
      placeholder: 'MICHQR100',
    },
  },
}))

const layout: SchemaFormLayout<keyof RedeemValues & string>[] = ['code']
const defaultValues: RedeemValues = { code: '' }
const loyalty = useLoyalty()
const successMessage = ref('')

async function submit(values: RedeemValues) {
  successMessage.value = ''
  const result = await loyalty.redeemCode(values.code.trim())
  successMessage.value = result.message
  emit('redeemed', result.message)
}
</script>

<template>
  <UICard intent="neutral" variant="subtle" :card-base-ui="{ body: 'rounded-md p-5' }">
    <h2 class="txt-h4 font-black">{{ $t('loyalty.redeem.title') }}</h2>
    <p class="txt-base mt-2 text-neutral-text-subtle">{{ $t('loyalty.redeem.description') }}</p>

    <UIAlert
      v-if="loyalty.errorMessage.value"
      class="mt-4"
      intent="error"
      :title="$t('loyalty.redeem.invalidTitle')"
      :description="loyalty.errorMessage.value"
    />
    <UIAlert
      v-if="successMessage"
      class="mt-4"
      intent="success"
      :title="$t('loyalty.redeem.successTitle')"
      :description="successMessage"
    />

    <UIForm
      class="mt-5"
      :schema="schema"
      :default-values="defaultValues"
      :fields="fields"
      :layout="layout"
      @submit="submit"
    >
      <template #actions="{ canSubmit, isSubmitting }">
        <UIButton
          type="submit"
          class="w-full sm:w-auto"
          :text="$t('loyalty.redeem.submit')"
          intent="primary"
          leading-icon="tabler:qrcode"
          :disabled="!canSubmit || isSubmitting || loyalty.pending.value"
          :state="isSubmitting || loyalty.pending.value ? 'loading' : 'default'"
        />
      </template>
    </UIForm>
  </UICard>
</template>
