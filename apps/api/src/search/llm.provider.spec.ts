import { MistralLlmProvider } from './llm.provider'

const environmentVariableNames = ['MISTRAL_API_KEY', 'MISTRAL_BASE_URL', 'MISTRAL_MODEL'] as const

describe('MistralLlmProvider', () => {
  const initialEnvironment = new Map<string, string | undefined>()
  const initialFetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch')

  beforeAll(() => {
    for (const name of environmentVariableNames) {
      initialEnvironment.set(name, process.env[name])
    }
  })

  afterEach(() => {
    if (initialFetchDescriptor === undefined) {
      Reflect.deleteProperty(globalThis, 'fetch')
    } else {
      Object.defineProperty(globalThis, 'fetch', initialFetchDescriptor)
    }

    for (const name of environmentVariableNames) {
      const initialValue = initialEnvironment.get(name)

      if (initialValue === undefined) {
        delete process.env[name]
      } else {
        process.env[name] = initialValue
      }
    }
  })

  it('uses the heuristic search without making a request when the API key is empty', async () => {
    process.env.MISTRAL_API_KEY = '   '
    const fetchMock = installFetchMock()
    const provider = new MistralLlmProvider()

    const plan = await provider.createSearchPlan('pneu gravel tubeless 700')

    expect(fetchMock).not.toHaveBeenCalled()
    expect(plan).toEqual({
      explanation: 'Sélection construite à partir des mots-clés de votre demande.',
      filters: {
        category: 'gravel',
        diameter: '700',
        terrain: 'GRAVEL',
        tubelessReady: true,
      },
      source: 'heuristic',
      suggestedSlugs: [],
    })
  })

  it('uses Mistral with the default endpoint and model when the API key is configured', async () => {
    process.env.MISTRAL_API_KEY = 'test-key'
    delete process.env.MISTRAL_BASE_URL
    delete process.env.MISTRAL_MODEL
    const fetchMock = installFetchMock()
    fetchMock.mockResolvedValue({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                explanation: 'Un pneu gravel adapté.',
                filters: {
                  category: 'gravel',
                  search: 'gravel',
                  terrain: 'GRAVEL',
                },
                suggestedSlugs: ['power-gravel'],
              }),
            },
          },
        ],
      }),
      ok: true,
    } as Response)
    const provider = new MistralLlmProvider()

    const plan = await provider.createSearchPlan('gravel')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.mistral.ai/v1/chat/completions',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }),
    )

    const request = fetchMock.mock.calls[0]?.[1]
    expect(JSON.parse(String(request?.body))).toEqual(
      expect.objectContaining({
        model: 'ministral-3b-2512',
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    )
    expect(plan).toEqual({
      explanation: 'Un pneu gravel adapté.',
      filters: {
        category: 'gravel',
        terrain: 'GRAVEL',
      },
      source: 'mistral',
      suggestedSlugs: [],
    })
  })

  it('falls back to the heuristic search when Mistral returns an error', async () => {
    process.env.MISTRAL_API_KEY = 'test-key'
    const fetchMock = installFetchMock()
    fetchMock.mockResolvedValue({ ok: false, status: 429 } as Response)
    const provider = new MistralLlmProvider()

    const plan = await provider.createSearchPlan('VTT électrique 29')

    expect(plan.filters).toEqual({
      category: 'mtb',
      diameter: '29',
      eBikeReady: true,
      terrain: 'MTB',
    })
    expect(plan.source).toBe('heuristic')
  })

  it('keeps only catalogue-specific residual terms in text search', async () => {
    process.env.MISTRAL_API_KEY = ''
    const provider = new MistralLlmProvider()

    const plan = await provider.createSearchPlan('Je cherche un pneu route Power Cup en 700')

    expect(plan.filters).toEqual({
      category: 'road',
      diameter: '700',
      search: 'power cup',
      terrain: 'ROAD',
    })
  })
})

function installFetchMock(): jest.MockedFunction<typeof fetch> {
  const fetchMock = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    value: fetchMock,
    writable: true,
  })
  return fetchMock
}
