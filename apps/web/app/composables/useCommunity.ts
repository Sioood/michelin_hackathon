import type {
  ChallengeLeaderboardEntry,
  CommunityChallenge,
  CommunityFeed,
  CommunityPost,
  CommunityPostType,
  CommunityUploadResponse,
  CreateCommunityPostInput,
} from '~/types/community'

const pageSize = 8

export function useCommunity() {
  const api = useApi()
  const config = useRuntimeConfig()

  const posts = ref<CommunityPost[]>([])
  const challenges = ref<CommunityChallenge[]>([])
  const leaderboards = ref<Record<number, ChallengeLeaderboardEntry[]>>({})
  const selectedType = ref<CommunityPostType | 'all'>('all')
  const page = ref(1)
  const pageCount = ref(1)
  const total = ref(0)
  const pending = ref(false)
  const errorMessage = ref('')

  async function loadFeed(options: { append?: boolean; type?: CommunityPostType | 'all' } = {}) {
    pending.value = true
    errorMessage.value = ''

    if (!options.append) {
      page.value = 1
    }

    if (options.type !== undefined) {
      selectedType.value = options.type
    }

    const query = new URLSearchParams({
      limit: String(pageSize),
      page: String(page.value),
    })

    if (selectedType.value !== 'all') {
      query.set('type', selectedType.value)
    }

    try {
      const feed = await api.request<CommunityFeed>(`/community/posts?${query.toString()}`)
      posts.value = options.append ? [...posts.value, ...feed.items] : feed.items
      page.value = feed.page
      pageCount.value = feed.pageCount
      total.value = feed.total
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
    } finally {
      pending.value = false
    }
  }

  async function loadMore() {
    if (page.value >= pageCount.value || pending.value) {
      return
    }

    page.value += 1
    await loadFeed({ append: true })
  }

  async function createPost(input: CreateCommunityPostInput): Promise<CommunityPost> {
    return api.request<CommunityPost>('/community/posts', {
      body: input,
      method: 'POST',
    })
  }

  async function uploadMedia(file: File): Promise<string> {
    const body = new FormData()
    body.append('file', file)

    const response = await api.request<CommunityUploadResponse>('/community/uploads', {
      body,
      method: 'POST',
    })

    return response.mediaUrl
  }

  async function reportPost(postId: number, reason: string): Promise<CommunityPost> {
    return api.request<CommunityPost>(`/community/posts/${postId}/report`, {
      body: { reason },
      method: 'POST',
    })
  }

  async function hidePost(postId: number): Promise<CommunityPost> {
    return api.request<CommunityPost>(`/community/posts/${postId}/hide`, {
      method: 'PATCH',
    })
  }

  async function loadChallenges() {
    challenges.value = await api.request<CommunityChallenge[]>('/community/challenges')
  }

  async function loadLeaderboard(challengeId: number) {
    leaderboards.value = {
      ...leaderboards.value,
      [challengeId]: await api.request<ChallengeLeaderboardEntry[]>(
        `/community/challenges/${challengeId}/leaderboard`,
      ),
    }
  }

  async function joinChallenge(challengeId: number, score: number, note?: string) {
    await api.request<ChallengeLeaderboardEntry>(`/community/challenges/${challengeId}/join`, {
      body: { note: note?.trim() || undefined, score },
      method: 'POST',
    })
    await Promise.all([loadChallenges(), loadLeaderboard(challengeId)])
  }

  function removePost(postId: number) {
    posts.value = posts.value.filter((post) => post.id !== postId)
    total.value = Math.max(0, total.value - 1)
  }

  function resolveMediaUrl(mediaUrl: string | null): string | null {
    if (mediaUrl === null || mediaUrl.length === 0) {
      return null
    }

    if (/^https?:\/\//.test(mediaUrl)) {
      return mediaUrl
    }

    return `${config.public.apiBaseUrl}${mediaUrl}`
  }

  return {
    challenges,
    createPost,
    errorMessage,
    hidePost,
    joinChallenge,
    leaderboards,
    loadChallenges,
    loadFeed,
    loadLeaderboard,
    loadMore,
    page,
    pageCount,
    pending,
    posts,
    removePost,
    reportPost,
    resolveMediaUrl,
    selectedType,
    total,
    uploadMedia,
  }
}
