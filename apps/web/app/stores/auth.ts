import type { AuthResponse, LoginInput, RegisterInput, User } from '~/types/user'

export const useAuthStore = defineStore('auth', () => {
  const tokenCookie = useCookie<string | null>('michelin_access_token', {
    default: () => null,
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })
  const userCookie = useCookie<User | null>('michelin_user', {
    default: () => null,
    maxAge: 60 * 60 * 24,
    sameSite: 'lax',
  })

  const token = computed(() => tokenCookie.value)
  const user = computed(() => userCookie.value)
  const isAuthenticated = computed(() => token.value !== null && user.value !== null)
  const displayName = computed(() => {
    if (user.value === null) {
      return ''
    }

    return [user.value.firstName, user.value.lastName].filter(Boolean).join(' ') || user.value.email
  })

  function setSession(response: AuthResponse) {
    tokenCookie.value = response.accessToken
    userCookie.value = response.user
  }

  async function login(input: LoginInput) {
    const api = useApi()
    const response = await api.request<AuthResponse>('/auth/login', {
      body: input,
      method: 'POST',
    })
    setSession(response)

    return response
  }

  async function register(input: RegisterInput) {
    const api = useApi()
    const response = await api.request<AuthResponse>('/auth/register', {
      body: input,
      method: 'POST',
    })
    setSession(response)

    return response
  }

  function logout() {
    tokenCookie.value = null
    userCookie.value = null
  }

  return {
    displayName,
    isAuthenticated,
    login,
    logout,
    register,
    token,
    user,
  }
})
