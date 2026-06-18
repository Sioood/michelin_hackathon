/**
 * Tire pressure calculator — pure logic, no API dependency.
 *
 * Based on commonly used cycling pressure formulas:
 * - Front tire: slightly lower pressure than rear
 * - Rear tire carries more rider weight (~60%)
 * - Surface type adjustments (road, gravel, mtb)
 * - Tubeless can run ~10-15% lower pressure
 */

import { assertNever } from '~nuxt-essentials/app/utils/assert-never'

export type BikeType = 'city' | 'e-bike' | 'gravel' | 'mtb' | 'road'
export type SurfaceType = 'asphalt' | 'gravel' | 'mixed' | 'trail'

export interface PressureInput {
  bikeType: BikeType
  riderWeightKg: number
  /** Bike weight in kg (default: 10) */
  bikeWeightKg?: number
  tireWidthMm: number
  tubeless?: boolean
  surface?: SurfaceType
}

export interface PressureResult {
  frontBar: number
  rearBar: number
  frontPsi: number
  rearPsi: number
  note: string
}

const BAR_TO_PSI = 14.5038
const MAX_PRESSURE_BAR = 9
const MIN_PRESSURE_BAR = 0.8
const REFERENCE_TOTAL_WEIGHT_KG = 80

/** Base pressure tables by tire width (mm) for road/pavement */
const BASE_PRESSURE_BY_WIDTH: Array<{ maxWidth: number; baseBar: number }> = [
  { baseBar: 8.0, maxWidth: 23 },
  { baseBar: 7.0, maxWidth: 25 },
  { baseBar: 6.0, maxWidth: 28 },
  { baseBar: 5.0, maxWidth: 32 },
  { baseBar: 4.0, maxWidth: 37 },
  { baseBar: 3.5, maxWidth: 42 },
  { baseBar: 3.0, maxWidth: 47 },
  { baseBar: 2.5, maxWidth: 54 },
  { baseBar: 2.0, maxWidth: 65 },
  { baseBar: 1.6, maxWidth: 80 },
  { baseBar: 1.3, maxWidth: 100 },
  { baseBar: 1.0, maxWidth: 130 },
]

function getBaseBar(tireWidthMm: number): number {
  const entry = BASE_PRESSURE_BY_WIDTH.find((e) => tireWidthMm <= e.maxWidth)
  return entry?.baseBar ?? 0.8
}

function surfaceMultiplier(surface: SurfaceType): number {
  switch (surface) {
    case 'asphalt':
      return 1.0
    case 'mixed':
      return 0.9
    case 'gravel':
      return 0.82
    case 'trail':
      return 0.75
    default:
      return assertNever(surface)
  }
}

function bikeTypeMultiplier(bikeType: BikeType): number {
  switch (bikeType) {
    case 'road':
      return 1.0
    case 'gravel':
      return 0.9
    case 'e-bike':
      return 1.05
    case 'mtb':
      return 0.85
    case 'city':
      return 0.95
    default:
      return assertNever(bikeType)
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum)
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function calculatePressure(input: PressureInput): PressureResult {
  const bikeWeightKg = input.bikeWeightKg ?? 10
  validateInput(input, bikeWeightKg)

  const totalWeightKg = input.riderWeightKg + bikeWeightKg
  const surface = input.surface ?? 'asphalt'

  const baseBar = getBaseBar(input.tireWidthMm)
  const surfMult = surfaceMultiplier(surface)
  const bikeMult = bikeTypeMultiplier(input.bikeType)
  const tubelessFactor = input.tubeless === true ? 0.88 : 1.0
  const weightFactor = totalWeightKg / REFERENCE_TOTAL_WEIGHT_KG
  const commonMultiplier = weightFactor * surfMult * bikeMult * tubelessFactor
  const rearBar = round1(clamp(baseBar * commonMultiplier, MIN_PRESSURE_BAR, MAX_PRESSURE_BAR))
  const frontBar = round1(
    clamp(baseBar * commonMultiplier * 0.9, MIN_PRESSURE_BAR, MAX_PRESSURE_BAR),
  )

  const note = buildNote(input, surface)

  return {
    frontBar,
    frontPsi: round1(frontBar * BAR_TO_PSI),
    note,
    rearBar,
    rearPsi: round1(rearBar * BAR_TO_PSI),
  }
}

function validateInput(input: PressureInput, bikeWeightKg: number): void {
  assertRange({
    label: 'Le poids du cycliste',
    maximum: 200,
    minimum: 30,
    value: input.riderWeightKg,
  })
  assertRange({ label: 'Le poids du vélo', maximum: 50, minimum: 5, value: bikeWeightKg })
  assertRange({ label: 'La largeur du pneu', maximum: 130, minimum: 18, value: input.tireWidthMm })
}

interface RangeConstraint {
  label: string
  maximum: number
  minimum: number
  value: number
}

function assertRange({ label, maximum, minimum, value }: RangeConstraint): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${label} doit être compris entre ${minimum} et ${maximum}.`)
  }
}

function buildNote(input: PressureInput, surface: SurfaceType): string {
  const parts: string[] = []

  if (input.tubeless === true) {
    parts.push('Tubeless : pression réduite de ~12 % pour plus de confort et moins de crevaisons.')
  }

  switch (surface) {
    case 'gravel':
      parts.push('Surface gravel : pression abaissée pour meilleure adhérence et absorption.')
      break
    case 'trail':
      parts.push('Trail/VTT : faible pression pour grip maximal en tout-terrain.')
      break
    case 'mixed':
      parts.push('Sol mixte : compromis route/off-road.')
      break
    case 'asphalt':
      break
    default:
      assertNever(surface)
  }

  if (input.riderWeightKg > 90) {
    parts.push('Poids élevé : augmentez légèrement si vous ressentez un manque de rigidité.')
  } else if (input.riderWeightKg < 60) {
    parts.push('Poids léger : vous pouvez baisser légèrement pour plus de confort.')
  }

  return parts.length > 0 ? parts.join(' ') : 'Valeurs indicatives — ajustez selon votre ressenti.'
}
