import type { AdminOverview } from '~/types/admin'

export function useAdmin() {
  const api = useApi()
  const overview = useState<AdminOverview | null>('admin-overview', () => null)
  const pending = ref(false)
  const errorMessage = ref('')

  async function loadOverview(): Promise<AdminOverview> {
    pending.value = true
    errorMessage.value = ''

    try {
      overview.value = await api.request<AdminOverview>('/admin/overview')
      return overview.value
    } catch (error) {
      errorMessage.value = api.getErrorMessage(error)
      throw error
    } finally {
      pending.value = false
    }
  }

  return {
    errorMessage,
    loadOverview,
    overview,
    pending,
  }
}
