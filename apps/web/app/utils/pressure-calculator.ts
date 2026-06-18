/**
 * Tire pressure calculator — pure logic, no API dependency.
 *
 * Based on commonly used cycling pressure formulas:
 * - Front tire: slightly lower pressure than rear
 * - Rear tire carries more rider weight (~60%)
 * - Surface type adjustments (road, gravel, mtb)
 * - Tubeless can run ~10-15% lower pressure
 */

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
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

export function calculatePressure(input: PressureInput): PressureResult {
  const bikeWeightKg = input.bikeWeightKg ?? 10
  const totalWeightKg = input.riderWeightKg + bikeWeightKg
  const surface = input.surface ?? 'asphalt'

  const baseBar = getBaseBar(input.tireWidthMm)

  // Weight scaling: reference total weight is 80 kg, scale linearly
  const weightFactor = totalWeightKg / 80

  // Rear tire carries ~60% of total weight, front ~40%
  const rearWeightFactor = weightFactor * 0.6 * (80 / (totalWeightKg * 0.6))
  const frontWeightFactor = weightFactor * 0.4 * (80 / (totalWeightKg * 0.4))

  const surfMult = surfaceMultiplier(surface)
  const bikeMult = bikeTypeMultiplier(input.bikeType)
  const tubelessFactor = input.tubeless === true ? 0.88 : 1.0

  const rearBar = round1(baseBar * weightFactor * surfMult * bikeMult * tubelessFactor)
  const frontBar = round1(rearBar * 0.9)

  void rearWeightFactor
  void frontWeightFactor

  const note = buildNote(input, surface)

  return {
    frontBar,
    frontPsi: round1(frontBar * BAR_TO_PSI),
    note,
    rearBar,
    rearPsi: round1(rearBar * BAR_TO_PSI),
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
    default:
      break
  }

  if (input.riderWeightKg > 90) {
    parts.push('Poids élevé : augmentez légèrement si vous ressentez un manque de rigidité.')
  } else if (input.riderWeightKg < 60) {
    parts.push('Poids léger : vous pouvez baisser légèrement pour plus de confort.')
  }

  return parts.length > 0 ? parts.join(' ') : 'Valeurs indicatives — ajustez selon votre ressenti.'
}
