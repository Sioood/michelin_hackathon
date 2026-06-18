import type { UIButtonSlots } from '~ui/app/components/Button.vue'

/** Yellow (secondary) buttons — primary blue label for contrast on secondary fill. */
export const secondaryButtonUi = {
  root: 'text-primary-text-default hover:text-primary-text-default-hover active:text-primary-text-default-active disabled:text-primary-text-subtle-disabled',
} satisfies Partial<UIButtonSlots>
