import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three'

import type { ProductCategory } from '~/types/product'

export interface TireVisualProfile {
  knobColor: string
  majorRadius: number
  sidewallColor: string
  treadColor: string
  treadStyle: 'knobby' | 'slick'
  tubeRadius: number
}

export const tireVisualProfiles: Record<ProductCategory, TireVisualProfile> = {
  'commuting-tour': {
    knobColor: '#1e293b',
    majorRadius: 1.4,
    sidewallColor: '#111111',
    treadColor: '#1a1a1a',
    treadStyle: 'slick',
    tubeRadius: 0.26,
  },
  'e-bike': {
    knobColor: '#14532d',
    majorRadius: 1.42,
    sidewallColor: '#101010',
    treadColor: '#181818',
    treadStyle: 'knobby',
    tubeRadius: 0.28,
  },
  gravel: {
    knobColor: '#3f2a14',
    majorRadius: 1.41,
    sidewallColor: '#101010',
    treadColor: '#1a1a1a',
    treadStyle: 'knobby',
    tubeRadius: 0.28,
  },
  'inner-tubes': {
    knobColor: '#312e81',
    majorRadius: 1.26,
    sidewallColor: '#1f1f1f',
    treadColor: '#2a2a2a',
    treadStyle: 'slick',
    tubeRadius: 0.17,
  },
  kids: {
    knobColor: '#4a2330',
    majorRadius: 1.22,
    sidewallColor: '#111111',
    treadColor: '#1a1a1a',
    treadStyle: 'knobby',
    tubeRadius: 0.23,
  },
  mtb: {
    knobColor: '#2f2610',
    majorRadius: 1.44,
    sidewallColor: '#0f0f0f',
    treadColor: '#161616',
    treadStyle: 'knobby',
    tubeRadius: 0.31,
  },
  road: {
    knobColor: '#8f0010',
    majorRadius: 1.42,
    sidewallColor: '#0d0d0d',
    treadColor: '#d71920',
    treadStyle: 'slick',
    tubeRadius: 0.24,
  },
}

function paintRubberGrain(ctx: CanvasRenderingContext2D, width: number, height: number) {
  for (let index = 0; index < 12_000; index += 1) {
    const alpha = Math.random() * 0.07
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1)
  }
}

interface PaintKnobsOptions {
  ctx: CanvasRenderingContext2D
  height: number
  knobColor: string
  treadHeight: number
  width: number
}

interface PaintBrandStripeOptions {
  ctx: CanvasRenderingContext2D
  height: number
  rangeName: string
  textColor: string
  width: number
  y: number
}

function paintKnobs(options: PaintKnobsOptions) {
  const { ctx, height, knobColor, treadHeight, width } = options
  ctx.fillStyle = knobColor

  const bands = [
    { offset: treadHeight * 0.35, span: treadHeight * 0.55 },
    { offset: height - treadHeight * 0.9, span: treadHeight * 0.55 },
  ]

  for (const band of bands) {
    for (let index = 0; index < 140; index += 1) {
      const x = (index / 140) * width + (index % 2 === 0 ? 6 : -4)
      const y = band.offset + ((index * 17) % Math.floor(band.span))
      const knobWidth = 10 + (index % 3) * 3
      const knobHeight = 5 + (index % 2) * 2
      ctx.beginPath()
      ctx.ellipse(x, y, knobWidth, knobHeight, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function paintBrandStripe(options: PaintBrandStripeOptions) {
  const { ctx, height, rangeName, textColor, width, y } = options
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, y, width, height)

  const fontSize = Math.floor(height * 0.42)
  ctx.fillStyle = textColor
  ctx.font = `italic 700 ${fontSize}px Inter, Arial, sans-serif`
  ctx.textBaseline = 'middle'

  const primaryLabel = 'MICHELIN'
  const secondaryLabel = rangeName.length > 28 ? `${rangeName.slice(0, 28)}…` : rangeName
  const step = width / 3

  for (let offset = 0; offset < width; offset += step) {
    ctx.fillText(primaryLabel, offset + 18, y + height * 0.52)
    ctx.font = `italic 600 ${Math.floor(fontSize * 0.72)}px Inter, Arial, sans-serif`
    ctx.fillText(secondaryLabel, offset + 18 + fontSize * 3.1, y + height * 0.54)
    ctx.font = `italic 700 ${fontSize}px Inter, Arial, sans-serif`
  }
}

export function createTireCanvasTexture(
  profile: TireVisualProfile,
  rangeName: string,
): CanvasTexture {
  const width = 2048
  const height = 512
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas 2D context is not available')
  }

  const treadHeight = Math.floor(height * 0.16)
  const brandHeight = Math.floor(height * 0.1)
  const brandOffset = Math.floor(height * 0.23)

  ctx.fillStyle = profile.sidewallColor
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = profile.treadColor
  ctx.fillRect(0, 0, width, treadHeight)
  ctx.fillRect(0, height - treadHeight, width, treadHeight)

  paintBrandStripe({
    ctx,
    height: brandHeight,
    rangeName,
    textColor: profile.sidewallColor,
    width,
    y: brandOffset,
  })
  paintBrandStripe({
    ctx,
    height: brandHeight,
    rangeName,
    textColor: profile.sidewallColor,
    width,
    y: height - brandOffset - brandHeight,
  })

  if (profile.treadStyle === 'knobby') {
    paintKnobs({ ctx, height, knobColor: profile.knobColor, treadHeight, width })
  }

  paintRubberGrain(ctx, width, height)

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.wrapS = RepeatWrapping
  texture.wrapT = RepeatWrapping
  texture.anisotropy = 8

  return texture
}
