<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { MathUtils } from 'three'

import type { ProductCategory } from '~/types/product'

type Tuple3 = [number, number, number]

interface SurfaceProfile {
  accent: string
  blockColor: string
  blockCount: number
  blockSize: Tuple3
  label: string
  ribColor: string
  stagger: number
  tubeRadius: number
}

interface TreadBlock {
  key: string
  color: string
  position: Tuple3
  rotation: Tuple3
  size: Tuple3
}

const props = defineProps<{
  category: ProductCategory
  rangeName: string
}>()

const rotationModel = ref([28])
const tiltModel = ref([10])
const spinAngle = ref(0)
const isSpinning = ref(true)

const categorySurface: Record<ProductCategory, SurfaceProfile> = {
  'commuting-tour': {
    accent: '#38bdf8',
    blockColor: '#273449',
    blockCount: 26,
    blockSize: [0.08, 0.34, 0.12],
    label: 'Urban Shield',
    ribColor: '#7dd3fc',
    stagger: 0.05,
    tubeRadius: 0.38,
  },
  'e-bike': {
    accent: '#22c55e',
    blockColor: '#1f3d2b',
    blockCount: 30,
    blockSize: [0.12, 0.42, 0.14],
    label: 'E-Bike Reinforced',
    ribColor: '#86efac',
    stagger: 0.11,
    tubeRadius: 0.44,
  },
  gravel: {
    accent: '#f59e0b',
    blockColor: '#4a3822',
    blockCount: 34,
    blockSize: [0.11, 0.29, 0.14],
    label: 'Mixed Terrain',
    ribColor: '#fbbf24',
    stagger: 0.18,
    tubeRadius: 0.41,
  },
  'inner-tubes': {
    accent: '#a855f7',
    blockColor: '#342546',
    blockCount: 20,
    blockSize: [0.06, 0.26, 0.08],
    label: 'Air Core',
    ribColor: '#d8b4fe',
    stagger: 0,
    tubeRadius: 0.28,
  },
  kids: {
    accent: '#f43f5e',
    blockColor: '#4a2330',
    blockCount: 24,
    blockSize: [0.1, 0.27, 0.12],
    label: 'Junior Grip',
    ribColor: '#fda4af',
    stagger: 0.14,
    tubeRadius: 0.36,
  },
  mtb: {
    accent: '#facc15',
    blockColor: '#3c3218',
    blockCount: 38,
    blockSize: [0.15, 0.36, 0.17],
    label: 'Trail Blocks',
    ribColor: '#fde68a',
    stagger: 0.23,
    tubeRadius: 0.46,
  },
  road: {
    accent: '#e5e7eb',
    blockColor: '#2f3440',
    blockCount: 28,
    blockSize: [0.05, 0.5, 0.08],
    label: 'Race Slick',
    ribColor: '#f8fafc',
    stagger: 0,
    tubeRadius: 0.34,
  },
}

const surface = computed(() => categorySurface[props.category])
const rotationDegrees = computed(() => (rotationModel.value[0] ?? 0) + spinAngle.value)
const rotationRadians = computed(() => MathUtils.degToRad(rotationDegrees.value))
const tiltRadians = computed(() => MathUtils.degToRad(tiltModel.value[0] ?? 0))
const sidewallRotation = computed<Tuple3>(() => [tiltRadians.value, rotationRadians.value, 0])
const innerTubeArgs = computed<Tuple3>(() => [1.36, surface.value.tubeRadius, 48])

const treadBlocks = computed<TreadBlock[]>(() => {
  const profile = surface.value
  const radius = 1.38

  return Array.from({ length: profile.blockCount }, (_, index) => {
    const angle = (index / profile.blockCount) * Math.PI * 2
    const offset = index % 2 === 0 ? profile.stagger : -profile.stagger

    return {
      color: profile.blockColor,
      key: `${props.category}-${index}`,
      position: [Math.cos(angle) * radius, Math.sin(angle) * radius, 0.38 + offset],
      rotation: [0, 0, angle],
      size: profile.blockSize,
    }
  })
})

let animationFrame: number | null = null
let previousTick = 0

function animate(timestamp: number) {
  if (previousTick === 0) {
    previousTick = timestamp
  }

  const delta = timestamp - previousTick
  previousTick = timestamp

  if (isSpinning.value) {
    spinAngle.value = (spinAngle.value + delta * 0.025) % 360
  }

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  animationFrame = requestAnimationFrame(animate)
})

onBeforeUnmount(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <section class="overflow-hidden rounded-md bg-neutral-bg-inverse text-primary-text-inverse">
    <div class="relative min-h-[22rem] px-4 py-6 sm:min-h-[28rem] sm:px-8">
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,.2),transparent_42%)]"
      />
      <div class="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="txt-caption font-black text-primary-text-inverse/60 uppercase">
            Michelin 3D Lab
          </p>
          <h2 class="txt-h3 mt-2 max-w-xl font-black">{{ rangeName }}</h2>
        </div>
        <UIBadge :label="surface.label" intent="secondary" size="sm" />
      </div>

      <div class="relative z-10 mt-5 grid gap-5 lg:grid-cols-[1fr_16rem] lg:items-end">
        <div class="h-[17rem] overflow-hidden rounded-md sm:h-[22rem]">
          <ClientOnly>
            <TresCanvas
              class="h-full w-full"
              :alpha="false"
              :clear-alpha="1"
              :clear-color="'#050505'"
              :dpr="[1, 2]"
              :preserve-drawing-buffer="true"
              render-mode="always"
              :shadows="true"
            >
              <TresPerspectiveCamera :position="[0, 0.05, 5.4]" :look-at="[0, 0, 0]" :fov="42" />
              <TresAmbientLight :intensity="0.75" />
              <TresDirectionalLight
                :position="[3.4, 4.2, 4.8]"
                :intensity="2.1"
                :cast-shadow="true"
              />
              <TresPointLight :position="[-3, -1.4, 3]" :intensity="1.2" :color="surface.accent" />

              <TresGroup :rotation="sidewallRotation">
                <TresMesh :cast-shadow="true" :receive-shadow="true">
                  <TresTorusGeometry :args="innerTubeArgs" />
                  <TresMeshStandardMaterial color="#10131a" :roughness="0.74" :metalness="0.08" />
                </TresMesh>

                <TresMesh>
                  <TresTorusGeometry :args="[0.91, 0.025, 24, 96]" />
                  <TresMeshStandardMaterial
                    :color="surface.ribColor"
                    :roughness="0.42"
                    :metalness="0.35"
                    emissive="#111827"
                  />
                </TresMesh>

                <TresMesh>
                  <TresTorusGeometry :args="[1.36, 0.018, 16, 128]" />
                  <TresMeshStandardMaterial
                    :color="surface.accent"
                    :roughness="0.36"
                    :metalness="0.2"
                    :emissive="surface.accent"
                    :emissive-intensity="0.18"
                  />
                </TresMesh>

                <TresMesh
                  v-for="block in treadBlocks"
                  :key="block.key"
                  :position="block.position"
                  :rotation="block.rotation"
                  :cast-shadow="true"
                >
                  <TresBoxGeometry :args="block.size" />
                  <TresMeshStandardMaterial
                    :color="block.color"
                    :roughness="0.82"
                    :metalness="0.05"
                  />
                </TresMesh>
              </TresGroup>
            </TresCanvas>

            <template #fallback>
              <div class="grid h-full place-items-center bg-black/80">
                <UIProgress intent="primary" size="sm" label="Chargement du viewer 3D..." />
              </div>
            </template>
          </ClientOnly>
        </div>

        <div class="rounded-md border border-white/10 bg-white/8 p-4 backdrop-blur">
          <div class="flex items-center justify-between gap-3">
            <p class="txt-label font-black">Vue produit</p>
            <UIButton
              type="button"
              :icon="isSpinning ? 'tabler:player-pause' : 'tabler:rotate-360'"
              :aria-label="isSpinning ? 'Pause' : 'Rotation'"
              intent="secondary"
              size="sm"
              @click="isSpinning = !isSpinning"
            />
          </div>
          <div class="mt-4 space-y-4">
            <UIFormSlider v-model="rotationModel" label="Rotation" :min="0" :max="360" :step="1" />
            <UIFormSlider v-model="tiltModel" label="Inclinaison" :min="-22" :max="24" :step="1" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
