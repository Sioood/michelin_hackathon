import { cva } from 'class-variance-authority'

import type { SelectIntent, SelectSize } from './context'

export const selectRootCVA = cva('flex w-full flex-col gap-1')

export const selectControlCVA = cva('flex min-w-0 flex-1 items-center gap-1')

export const selectTriggerCVA = cva(
  [
    'inline-flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden',
    'rounded-md border-0 bg-transparent shadow-none outline-none',
    'hover:bg-transparent active:scale-100',
  ],
  {
    variants: {
      disabled: {
        false: '',
        true: 'cursor-not-allowed',
      },
      intent: {
        accent: 'text-accent-text-default',
        neutral: 'text-neutral-text-default',
        primary: 'text-primary-text-default',
        secondary: 'text-secondary-text-default',
      } satisfies Record<SelectIntent, string>,
      size: {
        lg: 'txt-h6 min-h-12 px-3',
        md: 'txt-base min-h-10 px-2',
        sm: 'txt-caption min-h-9 px-1.5',
      } satisfies Record<SelectSize, string>,
    },
  },
)

export const selectClearTriggerCVA = cva(
  'cursor-pointer hover:text-error-text-default-hover data-[disabled=true]:cursor-not-allowed [hidden]:hidden',
)

export const selectPositionerCVA = cva('origin-(--transform-origin)')

export const selectContentCVA = cva(
  [
    'overflow-y-auto rounded-md border shadow-md',
    'data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
    'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
    'max-h-[min(var(--available-height,20rem),20rem)]',
    'w-(--reference-width) max-w-(--reference-width) min-w-(--reference-width)',
  ],
  {
    variants: {
      intent: {
        accent: 'border-accent-border-subtle bg-neutral-surface-default text-accent-text-default',
        neutral:
          'border-neutral-border-subtle bg-neutral-surface-default text-neutral-text-default',
        primary:
          'border-primary-border-subtle bg-neutral-surface-default text-primary-text-default',
        secondary:
          'border-secondary-border-subtle bg-neutral-surface-default text-secondary-text-default',
      } satisfies Record<SelectIntent, string>,
      size: {
        lg: 'txt-base p-1',
        md: 'txt-label p-1',
        sm: 'txt-caption p-1',
      } satisfies Record<SelectSize, string>,
    },
  },
)

export const selectItemCVA = cva(
  'flex min-w-0 cursor-pointer items-center rounded-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
  {
    variants: {
      intent: {
        accent:
          'text-accent-text-default data-[disabled]:text-accent-text-subtle data-[highlighted]:bg-accent-fill-subtle-hover',
        neutral:
          'text-neutral-text-default data-[disabled]:text-neutral-text-subtle data-[highlighted]:bg-neutral-fill-subtle-hover',
        primary:
          'text-primary-text-default data-[disabled]:text-primary-text-subtle data-[highlighted]:bg-primary-fill-subtle-hover',
        secondary:
          'text-secondary-text-default data-[disabled]:text-secondary-text-subtle data-[highlighted]:bg-secondary-fill-subtle-hover',
      } satisfies Record<SelectIntent, string>,
      size: {
        lg: 'txt-base gap-2 px-3 py-2',
        md: 'txt-label gap-2 px-2 py-1.5',
        sm: 'txt-caption gap-2 px-2 py-1',
      } satisfies Record<SelectSize, string>,
    },
  },
)

export const selectItemGroupLabelCVA = cva('', {
  variants: {
    intent: {
      accent: 'text-accent-text-subtle',
      neutral: 'text-neutral-text-subtle',
      primary: 'text-primary-text-subtle',
      secondary: 'text-secondary-text-subtle',
    } satisfies Record<SelectIntent, string>,
    size: {
      lg: 'txt-label px-2 py-1',
      md: 'txt-caption px-2 py-1',
      sm: 'txt-caption px-2 py-1',
    } satisfies Record<SelectSize, string>,
  },
})

export const selectLabelCVA = cva('block', {
  variants: {
    intent: {
      accent:
        'text-accent-text-default data-[disabled]:opacity-50 data-[invalid]:text-error-text-default',
      neutral:
        'text-neutral-text-default data-[disabled]:opacity-50 data-[invalid]:text-error-text-default',
      primary:
        'text-primary-text-default data-[disabled]:opacity-50 data-[invalid]:text-error-text-default',
      secondary:
        'text-secondary-text-default data-[disabled]:opacity-50 data-[invalid]:text-error-text-default',
    } satisfies Record<SelectIntent, string>,
    size: {
      lg: 'txt-h6',
      md: 'txt-label',
      sm: 'txt-caption',
    } satisfies Record<SelectSize, string>,
  },
})

export const selectIconSizeCVA = cva('shrink-0', {
  variants: {
    size: {
      lg: 'size-4',
      md: 'size-3.5',
      sm: 'size-3',
    } satisfies Record<SelectSize, string>,
  },
})
