import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op } from 'sequelize'

import { User } from '../users/user.model'

import { createCommunityChallengeSeeds } from './challenges/challenges.seed'
import { CommunityChallengeEntry } from './challenges/community-challenge-entry.model'
import { CommunityChallenge } from './challenges/community-challenge.model'
import { CommunityPost } from './community-post.model'
import { CommunityPostReport } from './moderation/community-post-report.model'

import type { CommunityChallengeEntryAttributes } from './challenges/community-challenge-entry.model'
import type { CommunityChallengeAttributes } from './challenges/community-challenge.model'
import type { CommunityPostAttributes } from './community-post.model'
import type { CommunityFeedQueryDto } from './dto/community-feed-query.dto'
import type { CreateCommunityPostDto } from './dto/create-community-post.dto'
import type { JoinChallengeDto } from './dto/join-challenge.dto'
import type { ReportPostDto } from './dto/report-post.dto'

export interface CommunityPostDto extends CommunityPostAttributes {
  userDisplayName: string
}

export interface CommunityFeedDto {
  items: CommunityPostDto[]
  page: number
  pageCount: number
  total: number
}

export interface CommunityChallengeDto extends CommunityChallengeAttributes {
  participantCount: number
}

export interface ChallengeLeaderboardEntryDto extends CommunityChallengeEntryAttributes {
  rank: number
  userDisplayName: string
}

@Injectable()
export class CommunityService implements OnModuleInit {
  @InjectModel(CommunityPost)
  private readonly postModel!: typeof CommunityPost

  @InjectModel(CommunityPostReport)
  private readonly reportModel!: typeof CommunityPostReport

  @InjectModel(CommunityChallenge)
  private readonly challengeModel!: typeof CommunityChallenge

  @InjectModel(CommunityChallengeEntry)
  private readonly challengeEntryModel!: typeof CommunityChallengeEntry

  async onModuleInit(): Promise<void> {
    const challenges = await this.challengeModel.findAll()

    if (challenges.some((challenge) => challenge.endsAt >= new Date())) {
      return
    }

    await this.challengeModel.bulkCreate(createCommunityChallengeSeeds())
  }

  async findFeed(query: CommunityFeedQueryDto): Promise<CommunityFeedDto> {
    const limit = query.limit ?? 12
    const page = query.page ?? 1
    const where = {
      ...(query.type === undefined ? {} : { type: query.type }),
      hidden: false,
    }
    const { count, rows } = await this.postModel.findAndCountAll({
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
      where,
    })

    return {
      items: rows.map((post) => this.toPostDto(post)),
      page,
      pageCount: Math.max(1, Math.ceil(count / limit)),
      total: count,
    }
  }

  async createPost(userId: number, input: CreateCommunityPostDto): Promise<CommunityPostDto> {
    if (input.type === 'challenge' && input.challengeId === undefined) {
      throw new BadRequestException('A challenge publication must select a challenge')
    }

    if (input.type !== 'challenge' && input.challengeId !== undefined) {
      throw new BadRequestException('Only challenge publications can select a challenge')
    }

    if (input.challengeId !== undefined) {
      const challenge = await this.findChallenge(input.challengeId)
      if (!this.isChallengeActive(challenge)) {
        throw new BadRequestException('Challenge is not active')
      }
    }

    const post = await this.postModel.create({
      body: input.body.trim(),
      challengeId: input.challengeId ?? null,
      mediaUrl: input.mediaUrl?.trim() || null,
      title: input.title.trim(),
      type: input.type,
      userId,
    })

    return this.findPostDto(post.id as number)
  }

  async reportPost(
    postId: number,
    userId: number,
    input: ReportPostDto,
  ): Promise<CommunityPostDto> {
    const post = await this.findPost(postId)

    if (post.userId === userId) {
      throw new BadRequestException('You cannot report your own post')
    }

    const existingReport = await this.reportModel.findOne({ where: { postId, userId } })

    if (existingReport !== null) {
      throw new ConflictException('Post already reported')
    }

    await this.reportModel.create({
      postId,
      reason: input.reason.trim(),
      userId,
    })

    const reportCount = await this.reportModel.count({ where: { postId } })
    await post.update({
      hidden: reportCount >= 3,
      reportCount,
    })

    return this.findPostDto(postId, true)
  }

  async hidePost(postId: number, userId: number): Promise<CommunityPostDto> {
    const post = await this.findPost(postId)

    if (post.userId !== userId) {
      throw new ForbiddenException('Only the author can hide this post')
    }

    await post.update({ hidden: true })

    return this.findPostDto(postId, true)
  }

  async findChallenges(): Promise<CommunityChallengeDto[]> {
    const challenges = await this.challengeModel.findAll({
      include: [CommunityChallengeEntry],
      order: [['endsAt', 'ASC']],
      where: { endsAt: { [Op.gte]: new Date() } },
    })

    return challenges.map((challenge) => this.toChallengeDto(challenge))
  }

  async joinChallenge(
    challengeId: number,
    userId: number,
    input: JoinChallengeDto,
  ): Promise<ChallengeLeaderboardEntryDto> {
    const challenge = await this.findChallenge(challengeId)
    if (!this.isChallengeActive(challenge)) {
      throw new BadRequestException('Challenge is not active')
    }

    const [entry] = await this.challengeEntryModel.findOrCreate({
      defaults: {
        challengeId,
        note: input.note?.trim() || null,
        score: input.score,
        userId,
      },
      where: { challengeId, userId },
    })

    await entry.update({
      note: input.note?.trim() || entry.note,
      score: Math.max(entry.score, input.score),
    })

    const leaderboard = await this.findLeaderboard(challengeId)
    const ownEntry = leaderboard.find((candidate) => candidate.userId === userId)

    if (ownEntry === undefined) {
      throw new NotFoundException('Challenge entry not found')
    }

    return ownEntry
  }

  async findLeaderboard(challengeId: number): Promise<ChallengeLeaderboardEntryDto[]> {
    await this.findChallenge(challengeId)

    const entries = await this.challengeEntryModel.findAll({
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
      limit: 20,
      order: [
        ['score', 'DESC'],
        ['updatedAt', 'ASC'],
      ],
      where: { challengeId },
    })

    return entries.map((entry, index) => this.toLeaderboardEntryDto(entry, index + 1))
  }

  private async findPost(postId: number): Promise<CommunityPost> {
    const post = await this.postModel.findByPk(postId)

    if (post === null) {
      throw new NotFoundException('Community post not found')
    }

    return post
  }

  private async findPostDto(postId: number, includeHidden = false): Promise<CommunityPostDto> {
    const post = await this.postModel.findOne({
      include: [{ attributes: ['firstName', 'lastName', 'email'], model: User }],
      where: includeHidden ? { id: postId } : { hidden: false, id: postId },
    })

    if (post === null) {
      throw new NotFoundException('Community post not found')
    }

    return this.toPostDto(post)
  }

  private async findChallenge(challengeId: number): Promise<CommunityChallenge> {
    const challenge = await this.challengeModel.findByPk(challengeId)

    if (challenge === null) {
      throw new NotFoundException('Community challenge not found')
    }

    return challenge
  }

  private isChallengeActive(challenge: CommunityChallenge): boolean {
    const now = new Date()
    return challenge.startsAt <= now && challenge.endsAt >= now
  }

  private toPostDto(post: CommunityPost): CommunityPostDto {
    const json = post.toJSON<
      CommunityPostAttributes & {
        user?: { email?: string; firstName?: string; lastName?: string }
      }
    >()
    const { user, ...rest } = json

    return {
      ...rest,
      userDisplayName: this.getUserDisplayName(user),
    }
  }

  private toChallengeDto(challenge: CommunityChallenge): CommunityChallengeDto {
    const json = challenge.toJSON<CommunityChallengeAttributes & { entries?: unknown[] }>()
    const { entries: _entries, ...rest } = json

    return {
      ...rest,
      participantCount: challenge.entries?.length ?? 0,
    }
  }

  private toLeaderboardEntryDto(
    entry: CommunityChallengeEntry,
    rank: number,
  ): ChallengeLeaderboardEntryDto {
    const json = entry.toJSON<
      CommunityChallengeEntryAttributes & {
        user?: { email?: string; firstName?: string; lastName?: string }
      }
    >()
    const { user, ...rest } = json

    return {
      ...rest,
      rank,
      userDisplayName: this.getUserDisplayName(user),
    }
  }

  private getUserDisplayName(user?: {
    email?: string
    firstName?: string
    lastName?: string
  }): string {
    const firstName = user?.firstName ?? ''
    const lastName = user?.lastName ?? ''
    const email = user?.email ?? ''

    return [firstName, lastName].filter(Boolean).join(' ') || email || 'Rider Michelin'
  }
}
