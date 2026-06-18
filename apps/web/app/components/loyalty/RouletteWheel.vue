<script setup lang="ts">
import type { RouletteSpinResult } from '~/types/loyalty'

const props = defineProps<{
  canSpin: boolean
  spinning?: boolean
}>()

const emit = defineEmits<{
  spin: []
}>()

const { t } = useI18n()

const segments = computed(() => [
  {
    fill: 'var(--color-primary-fill-default)',
    label: t('loyalty.roulette.segments.points10'),
    textFill: 'var(--color-primary-text-inverse)',
  },
  {
    fill: 'var(--color-secondary-fill-default)',
    label: t('loyalty.roulette.segments.points25'),
    textFill: 'var(--color-primary-text-default)',
  },
  {
    fill: 'var(--color-accent-fill-default)',
    label: t('loyalty.roulette.segments.points50'),
    textFill: 'var(--color-accent-text-inverse)',
  },
  {
    fill: 'var(--color-success-fill-default)',
    label: t('loyalty.roulette.segments.points100'),
    textFill: 'var(--color-success-text-inverse)',
  },
  {
    fill: 'var(--color-warning-fill-default)',
    label: t('loyalty.roulette.segments.discount5'),
    textFill: 'var(--color-primary-text-default)',
  },
  {
    fill: 'var(--color-error-fill-default)',
    label: t('loyalty.roulette.segments.discount10'),
    textFill: 'var(--color-error-text-inverse)',
  },
])

const rotation = ref(0)
const lastResult = ref<RouletteSpinResult | null>(null)
const isAnimating = ref(false)

const wheelSize = 200
const wheelCenter = wheelSize / 2
const wheelRadius = 96
const segmentAngle = computed(() => 360 / segments.value.length)

function polarToCartesian(radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180

  return {
    x: wheelCenter + radius * Math.cos(radians),
    y: wheelCenter + radius * Math.sin(radians),
  }
}

function describeSlice(startAngle: number, endAngle: number) {
  const start = polarToCartesian(wheelRadius, endAngle)
  const end = polarToCartesian(wheelRadius, startAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${wheelCenter} ${wheelCenter}`,
    `L ${start.x} ${start.y}`,
    `A ${wheelRadius} ${wheelRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

function labelPosition(index: number) {
  const angle = index * segmentAngle.value + segmentAngle.value / 2
  const point = polarToCartesian(62, angle)

  return {
    angle,
    x: point.x,
    y: point.y,
  }
}

function spinToLabel(label: string) {
  const targetIndex = segments.value.findIndex((segment) => segment.label === label)
  const index = targetIndex >= 0 ? targetIndex : 0
  const extraTurns = 4 * 360
  const targetRotation = extraTurns + (360 - index * segmentAngle.value - segmentAngle.value / 2)
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
        class="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1 border-x-8 border-b-[14px] border-x-transparent border-b-primary-fill-default"
        aria-hidden="true"
      />

      <div
        class="relative size-full overflow-hidden rounded-full border-8 border-neutral-border-strong bg-neutral-surface-default shadow-lg"
      >
        <svg
          viewBox="0 0 200 200"
          class="size-full origin-center transition-transform duration-[3000ms] ease-out"
          :style="{ transform: `rotate(${rotation}deg)` }"
          role="img"
          :aria-label="$t('loyalty.roulette.aria')"
        >
          <g>
            <path
              v-for="(segment, index) in segments"
              :key="segment.label"
              :d="describeSlice(index * segmentAngle, (index + 1) * segmentAngle)"
              :fill="segment.fill"
              stroke="var(--color-neutral-border-strong)"
              stroke-width="1"
            />
          </g>

          <g v-for="(segment, index) in segments" :key="`${segment.label}-label`">
            <text
              :x="labelPosition(index).x"
              :y="labelPosition(index).y"
              :fill="segment.textFill"
              :transform="`rotate(${labelPosition(index).angle} ${labelPosition(index).x} ${labelPosition(index).y})`"
              class="txt-caption font-black"
              dominant-baseline="middle"
              text-anchor="middle"
            >
              {{ segment.label }}
            </text>
          </g>
        </svg>
      </div>

      <div
        class="pointer-events-none absolute top-1/2 left-1/2 z-10 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-neutral-border-strong bg-neutral-surface-default shadow-md"
        aria-hidden="true"
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

<style scoped>
svg text {
  font-family: inherit;
  font-size: 9px;
  letter-spacing: 0;
}
</style>
