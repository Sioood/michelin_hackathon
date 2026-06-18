<script setup lang="ts">
import type { RouletteSpinResult } from '~/types/loyalty'

const props = defineProps<{
  canSpin: boolean
  spinning?: boolean
}>()

const emit = defineEmits<{
  spin: []
}>()

const segments = [
  { color: 'bg-primary-fill-default', label: '10 points' },
  { color: 'bg-secondary-fill-default', label: '25 points' },
  { color: 'bg-accent-fill-default', label: '50 points' },
  { color: 'bg-success-fill-default', label: '100 points' },
  { color: 'bg-warning-fill-default', label: '5% de réduction' },
  { color: 'bg-error-fill-default', label: '10% de réduction' },
] as const

const rotation = ref(0)
const lastResult = ref<RouletteSpinResult | null>(null)
const isAnimating = ref(false)

const segmentAngle = 360 / segments.length

function spinToLabel(label: string) {
  const targetIndex = segments.findIndex((segment) => segment.label === label)
  const index = targetIndex >= 0 ? targetIndex : 0
  const extraTurns = 4 * 360
  const targetRotation = extraTurns + (360 - index * segmentAngle - segmentAngle / 2)
  rotation.value = targetRotation
}

function handleSpinClick() {
  if (!props.canSpin || props.spinning || isAnimating.value) {
    return
  }

  isAnimating.value = true
  lastResult.value = null
  emit('spin')
}

function onSpinComplete(result: RouletteSpinResult) {
  spinToLabel(result.label)
  window.setTimeout(() => {
    lastResult.value = result
    isAnimating.value = false
  }, 3200)
}

defineExpose({ onSpinComplete })
</script>

<template>
  <div class="grid justify-items-center gap-6">
    <div class="relative size-72 max-w-full sm:size-80">
      <div
        class="absolute inset-0 rounded-full border-8 border-neutral-border-strong shadow-lg transition-transform duration-[3000ms] ease-out"
        :style="{ transform: `rotate(${rotation}deg)` }"
      >
        <div
          v-for="(segment, index) in segments"
          :key="segment.label"
          class="absolute top-1/2 left-1/2 h-1/2 w-1/2 origin-bottom-left"
          :style="{
            transform: `rotate(${index * segmentAngle}deg) skewY(-${90 - segmentAngle}deg)`,
          }"
        >
          <div
            :class="segment.color"
            class="txt-caption flex h-full w-full items-start justify-center pt-6 text-center font-black text-primary-text-inverse"
          >
            <span class="-rotate-90 whitespace-nowrap">{{ segment.label }}</span>
          </div>
        </div>
      </div>
      <div
        class="absolute top-1/2 left-1/2 z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-border-strong bg-neutral-surface-default shadow-md"
      />
      <div
        class="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1 border-x-8 border-b-[14px] border-x-transparent border-b-primary-fill-default"
      />
    </div>

    <UIButton
      type="button"
      :text="canSpin ? $t('loyalty.roulette.spin') : $t('loyalty.roulette.comeBack')"
      intent="primary"
      size="lg"
      leading-icon="tabler:rotate-clockwise"
      :disabled="!canSpin || spinning || isAnimating"
      :state="spinning || isAnimating ? 'loading' : 'default'"
      @click="handleSpinClick"
    />

    <UIAlert
      v-if="lastResult"
      class="max-w-md"
      intent="success"
      :title="$t('loyalty.roulette.won', { prize: lastResult.label })"
      :description="$t('loyalty.roulette.newBalance', { count: lastResult.balance })"
    />
  </div>
</template>
