import { createCommunityChallengeSeeds } from './challenges.seed'

describe('createCommunityChallengeSeeds', () => {
  it('creates fresh weekly and monthly challenges from the supplied date', () => {
    const now = new Date('2026-06-18T14:30:00.000Z')

    const seeds = createCommunityChallengeSeeds(now)

    expect(seeds).toHaveLength(2)
    expect(seeds.map((seed) => seed.metric)).toEqual(['distance_km', 'posts'])
    expect(seeds[0]?.startsAt.getHours()).toBe(0)
    expect(seeds[0]?.startsAt.getMinutes()).toBe(0)
    expect(seeds[0]?.endsAt.getDate()).toBe(18)
    expect(seeds[0]?.endsAt.getMonth()).toBe(6)
    expect(seeds[1]?.endsAt.getDate()).toBe(25)
    expect(seeds[1]?.endsAt.getMonth()).toBe(5)
  })
})
