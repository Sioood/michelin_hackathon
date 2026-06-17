import type { Product } from './product'

export type BikeType = 'city' | 'e-bike' | 'gravel' | 'mtb' | 'road'
export type TirePosition = 'both' | 'front' | 'rear'
export type GarageReminderReason = 'age' | 'distance'
export type GarageReminderSeverity = 'due' | 'ok' | 'soon'

export interface GarageReminder {
  installationId: number
  message: string
  reason: GarageReminderReason
  severity: GarageReminderSeverity
}

export interface TireInstallation {
  bikeId: number
  currentDistanceKm: number
  distanceKmAtInstall: number
  id: number
  installedAt: string
  notes: string | null
  orderId: number | null
  orderItemId: number | null
  position: TirePosition
  product: Product
  productId: number
  reminder: GarageReminder | null
}

export interface Bike {
  annualDistanceKm: number
  brand: string | null
  id: number
  model: string | null
  name: string
  reminders: GarageReminder[]
  tireInstallations: TireInstallation[]
  type: BikeType
  userId: number
  wheelDiameter: string | null
}

export interface CreateBikeInput {
  annualDistanceKm?: number
  brand?: string
  model?: string
  name: string
  type: BikeType
  wheelDiameter?: string
}

export type UpdateBikeInput = Partial<CreateBikeInput>

export interface InstallTireInput {
  currentDistanceKm?: number
  distanceKmAtInstall?: number
  installedAt?: string
  notes?: string
  orderId?: number
  orderItemId?: number
  position?: TirePosition
  productId: number
}

export type UpdateTireInstallationInput = Omit<
  Partial<InstallTireInput>,
  'orderId' | 'orderItemId' | 'productId'
>
