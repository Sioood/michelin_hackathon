import type { CommunityChallengeCreationAttributes } from './community-challenge.model'

export function createCommunityChallengeSeeds(
  now = new Date(),
): CommunityChallengeCreationAttributes[] {
  const startsAt = new Date(now)
  startsAt.setHours(0, 0, 0, 0)

  const monthEnd = addDays(startsAt, 30)
  const weekEnd = addDays(startsAt, 7)

  return [
    {
      description: 'Cumulez vos kilomètres sur route, gravel ou VTT et partagez votre progression.',
      endsAt: monthEnd,
      metric: 'distance_km',
      startsAt,
      title: 'Objectif 500 km Michelin',
    },
    {
      description: 'Publiez un retour terrain utile avec photo, pression et conditions de roulage.',
      endsAt: weekEnd,
      metric: 'posts',
      startsAt,
      title: 'Test riders de la semaine',
    },
  ]
}

function addDays(value: Date, days: number): Date {
  const result = new Date(value)
  result.setDate(result.getDate() + days)
  return result
}
