import type {
  LoyaltyOverview,
  RedeemCodeResult,
  RedeemRewardResult,
  RouletteSpinResult,
} from '~/types/loyalty'

export function useLoyalty() {
  const api = useApi()
  const auth = useAuthStore()
  const overview = ref<LoyaltyOverview | null>(null)
  const pending = ref(false)
  const errorMessage = ref('')

  const balance = computed(() => overview.value?.balance ?? 0)
  const canSpinRoulette = computed(() => overview.value?.canSpinRoulette ?? false)

  async function run<T>(action: () => Promise<T>): Promise<T> {
    pending.value = true
    errorMessage.value = ''

    try {
      return await action()
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
      throw error
    } finally {
      pending.value = false
    }
  }

  async function loadOverview(): Promise<LoyaltyOverview | null> {
    if (!auth.isAuthenticated) {
      overview.value = null
      return null
    }

    return run(async () => {
      overview.value = await api.request<LoyaltyOverview>('/loyalty')
      return overview.value
    })
  }

  async function redeemCode(code: string): Promise<RedeemCodeResult> {
    return run(async () => {
      const result = await api.request<RedeemCodeResult>('/loyalty/redeem-code', {
        body: { code },
        method: 'POST',
      })
      if (overview.value !== null) {
        overview.value = { ...overview.value, balance: result.balance }
      }
      return result
    })
  }

  async function redeemReward(rewardId: string): Promise<RedeemRewardResult> {
    return run(async () => {
      const result = await api.request<RedeemRewardResult>('/loyalty/redeem-reward', {
        body: { rewardId },
        method: 'POST',
      })
      await loadOverview()
      return result
    })
  }

  async function spinRoulette(): Promise<RouletteSpinResult> {
    return run(async () => {
      const result = await api.request<RouletteSpinResult>('/games/roulette/spin', {
        method: 'POST',
      })
      if (overview.value !== null) {
        overview.value = {
          ...overview.value,
          balance: result.balance,
          canSpinRoulette: false,
          lastRouletteSpinAt: new Date().toISOString(),
        }
      }
      return result
    })
  }

  function clear() {
    overview.value = null
    errorMessage.value = ''
  }

  return {
    balance,
    canSpinRoulette,
    clear,
    errorMessage,
    loadOverview,
    overview,
    pending,
    redeemCode,
    redeemReward,
    spinRoulette,
  }
}
