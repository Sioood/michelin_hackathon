import type { SearchTerrain } from './search.types'

const terrainMap: Record<SearchTerrain, string[]> = {
  CITY: ['ASPHALT'],
  GRAVEL: ['ASPHALT', 'OFFROAD HARD PACKED', 'OFFROAD MIXED'],
  MIXED: ['ASPHALT', 'OFFROAD HARD PACKED', 'OFFROAD MIXED', 'OFFROAD SOFT', 'OFFROAD MUD'],
  MTB: ['OFFROAD HARD PACKED', 'OFFROAD MIXED', 'OFFROAD SOFT', 'OFFROAD MUD'],
  ROAD: ['ASPHALT'],
}

export function mapSearchTerrainToProductTerrains(terrain: SearchTerrain | string): string[] {
  const key = terrain.toUpperCase() as SearchTerrain
  return terrainMap[key] ?? [terrain.toUpperCase()]
}

export function productMatchesSearchTerrain(
  terrainTypes: string[],
  terrain: SearchTerrain,
): boolean {
  const mapped = mapSearchTerrainToProductTerrains(terrain)
  return mapped.some((value) => terrainTypes.includes(value))
}
