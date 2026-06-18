import { Injectable } from '@nestjs/common'

import type { BikeTireInstallation } from './bike-tire-installation.model'

export type GarageReminderSeverity = 'due' | 'soon' | 'ok'
export type GarageReminderReason = 'age' | 'distance'

export interface GarageReminderDto {
  installationId: number
  message: string
  reason: GarageReminderReason
  severity: GarageReminderSeverity
}

const distanceLimitKm = 3000
const distanceSoonKm = 2500
const ageLimitMonths = 18
const ageSoonMonths = 15

@Injectable()
export class GarageReminderService {
  createReminder(installation: BikeTireInstallation): GarageReminderDto | null {
    if (installation.id === undefined) {
      return null
    }

    const riddenKm = Math.max(0, installation.currentDistanceKm - installation.distanceKmAtInstall)
    const ageMonths = this.diffMonths(installation.installedAt, new Date())

    if (riddenKm >= distanceLimitKm) {
      return {
        installationId: installation.id,
        message: `Remplacement recommandé: ${riddenKm} km parcourus depuis l'installation.`,
        reason: 'distance',
        severity: 'due',
      }
    }

    if (ageMonths >= ageLimitMonths) {
      return {
        installationId: installation.id,
        message: `Remplacement recommandé: pneu installé depuis ${ageMonths} mois.`,
        reason: 'age',
        severity: 'due',
      }
    }

    if (riddenKm >= distanceSoonKm) {
      return {
        installationId: installation.id,
        message: `À surveiller: ${riddenKm} km parcourus, remplacement proche.`,
        reason: 'distance',
        severity: 'soon',
      }
    }

    if (ageMonths >= ageSoonMonths) {
      return {
        installationId: installation.id,
        message: `À surveiller: pneu installé depuis ${ageMonths} mois.`,
        reason: 'age',
        severity: 'soon',
      }
    }

    return {
      installationId: installation.id,
      message: 'Pneu dans la fenêtre recommandée.',
      reason: 'distance',
      severity: 'ok',
    }
  }

  private diffMonths(start: Date, end: Date): number {
    return Math.max(
      0,
      (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth(),
    )
  }
}
