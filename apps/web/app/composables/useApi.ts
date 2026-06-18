type ApiOptions<TResponse> = NonNullable<Parameters<typeof $fetch<TResponse>>[1]>

function createGuestCartId(): string {
  if (globalThis.crypto?.randomUUID !== undefined) {
    return globalThis.crypto.randomUUID()
  }

  return `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useApi() {
  const config = useRuntimeConfig()
  const guestCartId = useCookie<string>('michelin_guest_cart_id', {
    default: createGuestCartId,
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
  })

  async function request<TResponse>(
    path: string,
    options: ApiOptions<TResponse> = {},
  ): Promise<TResponse> {
    const auth = useAuthStore()
    const headers = new Headers(options.headers as HeadersInit | undefined)
    headers.set('x-guest-cart-id', guestCartId.value)

    if (auth.token !== null) {
      headers.set('Authorization', `Bearer ${auth.token}`)
    }

    return $fetch<TResponse>(path, {
      ...options,
      baseURL: config.public.apiBaseUrl,
      headers,
    })
  }

  function getErrorMessage(error: unknown): string {
    const fetchError = error as {
      data?: { message?: string | string[] }
      message?: string
    }
    const message = fetchError.data?.message

    if (Array.isArray(message)) {
      return message.join(', ')
    }

    return message ?? fetchError.message ?? 'Une erreur est survenue.'
  }

  return {
    getErrorMessage,
    request,
  }
}
