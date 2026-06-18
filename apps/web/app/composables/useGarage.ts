import type {
  Bike,
  BikeType,
  CreateBikeInput,
  InstallTireInput,
  UpdateBikeInput,
  UpdateTireInstallationInput,
} from '~/types/garage'
import type { Product } from '~/types/product'

import { categoryForBikeType, pickGarageSuggestions } from '~/utils/garage-suggestions'

export function useGarage() {
  const api = useApi()
  const bikes = useState<Bike[]>('garage-bikes', () => [])
  const currentBike = useState<Bike | null>('garage-current-bike', () => null)
  const suggestions = useState<Product[]>('garage-suggestions', () => [])
  const pending = ref(false)
  const errorMessage = ref('')

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

  async function loadBikes(): Promise<Bike[]> {
    return run(async () => {
      bikes.value = await api.request<Bike[]>('/garage/bikes')
      return bikes.value
    })
  }

  async function loadBike(bikeId: number): Promise<Bike> {
    return run(async () => {
      currentBike.value = await api.request<Bike>(`/garage/bikes/${bikeId}`)
      return currentBike.value
    })
  }

  async function createBike(input: CreateBikeInput): Promise<Bike> {
    return run(async () => {
      const bike = await api.request<Bike>('/garage/bikes', {
        body: input,
        method: 'POST',
      })
      bikes.value = [bike, ...bikes.value.filter((item) => item.id !== bike.id)]
      return bike
    })
  }

  async function updateBike(bikeId: number, input: UpdateBikeInput): Promise<Bike> {
    return run(async () => {
      const bike = await api.request<Bike>(`/garage/bikes/${bikeId}`, {
        body: input,
        method: 'PATCH',
      })
      currentBike.value = bike
      bikes.value = bikes.value.map((item) => (item.id === bike.id ? bike : item))
      return bike
    })
  }

  async function removeBike(bikeId: number): Promise<void> {
    await run(async () => {
      await api.request<{ deleted: true }>(`/garage/bikes/${bikeId}`, { method: 'DELETE' })
      bikes.value = bikes.value.filter((bike) => bike.id !== bikeId)
      if (currentBike.value?.id === bikeId) {
        currentBike.value = null
      }
    })
  }

  async function installTire(bikeId: number, input: InstallTireInput): Promise<Bike> {
    return run(async () => {
      const bike = await api.request<Bike>(`/garage/bikes/${bikeId}/tires`, {
        body: input,
        method: 'POST',
      })
      currentBike.value = bike
      bikes.value = bikes.value.map((item) => (item.id === bike.id ? bike : item))
      return bike
    })
  }

  async function updateTireInstallation(
    bikeId: number,
    installationId: number,
    input: UpdateTireInstallationInput,
  ): Promise<Bike> {
    return run(async () => {
      const bike = await api.request<Bike>(`/garage/bikes/${bikeId}/tires/${installationId}`, {
        body: input,
        method: 'PATCH',
      })
      currentBike.value = bike
      bikes.value = bikes.value.map((item) => (item.id === bike.id ? bike : item))
      return bike
    })
  }

  async function removeTireInstallation(bikeId: number, installationId: number): Promise<Bike> {
    return run(async () => {
      const bike = await api.request<Bike>(`/garage/bikes/${bikeId}/tires/${installationId}`, {
        method: 'DELETE',
      })
      currentBike.value = bike
      bikes.value = bikes.value.map((item) => (item.id === bike.id ? bike : item))
      return bike
    })
  }

  async function loadCatalogueFallback(
    type?: BikeType,
    diameter?: string | null,
  ): Promise<Product[]> {
    const category = categoryForBikeType(type)
    const products = await api.request<Product[]>('/products', {
      query: {
        category,
      },
    })

    return pickGarageSuggestions(products, diameter)
  }

  async function loadSuggestions(
    type?: BikeType,
    diameter?: string | null,
    bikeId?: number,
  ): Promise<Product[]> {
    return run(async () => {
      if (bikeId !== undefined && Number.isFinite(bikeId)) {
        suggestions.value = await api.request<Product[]>(`/garage/bikes/${bikeId}/suggestions`)
      } else {
        suggestions.value = await api.request<Product[]>('/garage/suggestions', {
          query: {
            diameter: diameter ?? undefined,
            type,
          },
        })
      }

      if (suggestions.value.length === 0) {
        suggestions.value = await loadCatalogueFallback(type, diameter)
      }

      return suggestions.value
    })
  }

  return {
    bikes,
    createBike,
    currentBike,
    errorMessage,
    installTire,
    loadBike,
    loadBikes,
    loadSuggestions,
    pending,
    removeBike,
    removeTireInstallation,
    suggestions,
    updateBike,
    updateTireInstallation,
  }
}
