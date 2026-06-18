import { BadRequestException } from '@nestjs/common'

import { CommunityService } from './community.service'

import type { CommunityChallenge } from './challenges/community-challenge.model'

describe('CommunityService', () => {
  it('creates a fresh challenge cycle when every stored challenge has expired', async () => {
    const challengeModel = {
      bulkCreate: jest.fn().mockResolvedValue([]),
      findAll: jest.fn().mockResolvedValue([
        {
          endsAt: new Date('2025-01-01T00:00:00.000Z'),
        } as CommunityChallenge,
      ]),
    }
    const service = new CommunityService()
    Reflect.set(service, 'challengeModel', challengeModel)

    await service.onModuleInit()

    expect(challengeModel.bulkCreate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ metric: 'distance_km' }),
        expect.objectContaining({ metric: 'posts' }),
      ]),
    )
  })

  it('keeps the current challenge cycle when one challenge is still active', async () => {
    const challengeModel = {
      bulkCreate: jest.fn(),
      findAll: jest.fn().mockResolvedValue([
        {
          endsAt: new Date(Date.now() + 60_000),
        } as CommunityChallenge,
      ]),
    }
    const service = new CommunityService()
    Reflect.set(service, 'challengeModel', challengeModel)

    await service.onModuleInit()

    expect(challengeModel.bulkCreate).not.toHaveBeenCalled()
  })

  it('requires challenge publications to select a challenge', async () => {
    const service = new CommunityService()

    await expect(
      service.createPost(1, {
        body: 'Participation au challenge.',
        title: 'Ma progression',
        type: 'challenge',
      }),
    ).rejects.toThrow(BadRequestException)
  })

  it('rejects a challenge id on a regular publication', async () => {
    const service = new CommunityService()

    await expect(
      service.createPost(1, {
        body: 'Retour sur une sortie gravel.',
        challengeId: 1,
        title: 'Sortie gravel',
        type: 'opinion',
      }),
    ).rejects.toThrow(BadRequestException)
  })
})
