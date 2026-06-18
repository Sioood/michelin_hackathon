<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
import { MathUtils } from 'three'

import type { CanvasTexture } from 'three'
import type { ProductCategory } from '~/types/product'

import { createTireCanvasTexture, tireVisualProfiles } from '~/utils/tire-texture'

type Tuple3 = [number, number, number]

const props = defineProps<{
  category: ProductCategory
  rangeName: string
}>()

const is3dView = ref(false)
const isDragging = ref(false)
const rotationY = ref(32)
const rotationX = ref(14)
const dragStart = { x: 0, y: 0 }
const dragRotation = { x: 14, y: 32 }
const tireTexture = shallowRef<CanvasTexture | null>(null)

const profile = computed(() => tireVisualProfiles[props.category])
const rotationRadians = computed(() => MathUtils.degToRad(rotationY.value))
const tiltRadians = computed(() => MathUtils.degToRad(rotationX.value))
const tireRotation = computed<Tuple3>(() => [tiltRadians.value, rotationRadians.value, 0])

function disposeTexture() {
  tireTexture.value?.dispose()
  tireTexture.value = null
}

function buildTexture() {
  if (!import.meta.client) {
    return
  }

  disposeTexture()
  tireTexture.value = createTireCanvasTexture(profile.value, props.rangeName)
}

function toggleView() {
  is3dView.value = !is3dView.value

  if (is3dView.value) {
    buildTexture()
  }
}

watch(
  () => [props.category, props.rangeName] as const,
  () => {
    if (is3dView.value) {
      buildTexture()
    }
  },
)

onBeforeUnmount(() => {
  disposeTexture()
})

function onPointerDown(event: PointerEvent) {
  isDragging.value = true
  dragStart.x = event.clientX
  dragStart.y = event.clientY
  dragRotation.x = rotationX.value
  dragRotation.y = rotationY.value
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!isDragging.value) {
    return
  }

  const deltaX = event.clientX - dragStart.x
  const deltaY = event.clientY - dragStart.y
  rotationY.value = dragRotation.y + deltaX * 0.5
  rotationX.value = Math.max(-45, Math.min(45, dragRotation.x + deltaY * 0.35))
}

function onPointerUp(event: PointerEvent) {
  isDragging.value = false
  ;(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId)
}
</script>

<template>
  <section
    class="relative overflow-hidden rounded-md border border-neutral-border-subtle bg-neutral-bg-default"
    :aria-label="`Visuel produit ${rangeName}`"
  >
    <div class="viewer-grid relative min-h-[22rem] sm:min-h-[28rem]">
      <div
        v-if="!is3dView"
        class="relative z-10 flex h-[22rem] items-center justify-center sm:h-[28rem]"
      >
        <CatalogueProductTireVisual :category="category" class="viewer-image" />
      </div>

      <div
        v-else
        class="relative z-10 h-[22rem] touch-none bg-white select-none sm:h-[28rem]"
        :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
        @pointercancel="onPointerUp"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
      >
        <ClientOnly>
          <TresCanvas
            v-if="tireTexture"
            class="pointer-events-none h-full w-full"
            :alpha="false"
            :clear-alpha="1"
            :clear-color="'#ffffff'"
            :dpr="[1, 2]"
            :preserve-drawing-buffer="true"
            render-mode="always"
            :shadows="false"
          >
            <TresPerspectiveCamera :position="[0, 0.04, 5.1]" :look-at="[0, 0, 0]" :fov="38" />
            <TresAmbientLight :intensity="1.2" />
            <TresDirectionalLight :position="[2.8, 5.2, 4.8]" :intensity="1.25" />
            <TresDirectionalLight :position="[-3.4, -1.6, 2.4]" :intensity="0.42" />

            <TresGroup :rotation="tireRotation">
              <TresMesh>
                <TresTorusGeometry :args="[profile.majorRadius, profile.tubeRadius, 96, 220]" />
                <TresMeshStandardMaterial :map="tireTexture" :metalness="0.04" :roughness="0.9" />
              </TresMesh>
            </TresGroup>
          </TresCanvas>

          <div v-else class="grid h-full place-items-center bg-white">
            <UIProgress intent="primary" size="sm" label="Chargement du viewer 3D..." />
          </div>

          <template #fallback>
            <div class="grid h-full place-items-center bg-white">
              <UIProgress intent="primary" size="sm" label="Chargement du viewer 3D..." />
            </div>
          </template>
        </ClientOnly>

        <p
          class="txt-caption pointer-events-none absolute right-24 bottom-3 left-4 text-neutral-text-subtle"
        >
          Cliquez et faites glisser pour orienter le pneu
        </p>
      </div>

      <button
        type="button"
        class="absolute right-4 bottom-4 z-20 flex size-16 flex-col items-center justify-center rounded-full bg-primary-fill-default text-primary-text-inverse shadow-lg transition-transform hover:scale-105 active:scale-95"
        :aria-label="is3dView ? 'Afficher la vue image' : 'Afficher la vue 3D'"
        @click="toggleView"
      >
        <Icon :name="is3dView ? 'tabler:photo' : 'tabler:rotate-3d'" class="size-7" />
        <span class="txt-caption mt-0.5 font-black">{{ is3dView ? '2D' : '3D' }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.viewer-grid {
  background-color: #ffffff;
  background-image:
    linear-gradient(
      to right,
      color-mix(in srgb, var(--color-neutral-border-subtle) 70%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in srgb, var(--color-neutral-border-subtle) 70%, transparent) 1px,
      transparent 1px
    );
  background-size: 24px 24px;
}

.viewer-image :deep(.product-visual) {
  min-height: 100%;
  background: transparent;
}
</style>
