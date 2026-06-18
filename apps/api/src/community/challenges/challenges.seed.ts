import type { CommunityChallengeCreationAttributes } from './community-challenge.model'

const now = new Date()
const startsAt = new Date(now)
startsAt.setHours(0, 0, 0, 0)

const monthEnd = new Date(startsAt)
monthEnd.setDate(monthEnd.getDate() + 30)

const weekEnd = new Date(startsAt)
weekEnd.setDate(weekEnd.getDate() + 7)

export const communityChallengeSeeds: CommunityChallengeCreationAttributes[] = [
  {
    description: 'Cumulez vos kilometres sur route, gravel ou VTT et partagez votre progression.',
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
