export type CommunityPostType = 'challenge' | 'opinion' | 'photo' | 'test' | 'video'

export type CommunityChallengeMetric = 'distance_km' | 'posts'

export interface CommunityPost {
  id: number
  userId: number
  type: CommunityPostType
  title: string
  body: string
  mediaUrl: string | null
  challengeId: number | null
  reportCount: number
  hidden: boolean
  userDisplayName: string
  createdAt: string
  updatedAt: string
}

export interface CommunityFeed {
  items: CommunityPost[]
  page: number
  pageCount: number
  total: number
}

export interface CommunityChallenge {
  id: number
  title: string
  description: string
  metric: CommunityChallengeMetric
  startsAt: string
  endsAt: string
  participantCount: number
  createdAt: string
  updatedAt: string
}

export interface ChallengeLeaderboardEntry {
  id: number
  challengeId: number
  userId: number
  score: number
  note: string | null
  rank: number
  userDisplayName: string
  createdAt: string
  updatedAt: string
}

export interface CreateCommunityPostInput {
  type: CommunityPostType
  title: string
  body: string
  mediaUrl?: string
  challengeId?: number
}

export interface CommunityUploadResponse {
  mediaUrl: string
}
