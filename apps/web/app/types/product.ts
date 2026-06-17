export type ProductCategory =
  | 'commuting-tour'
  | 'e-bike'
  | 'gravel'
  | 'inner-tubes'
  | 'kids'
  | 'mtb'
  | 'road'

export interface ProductProStats {
  victories: number
  podiums: number
  proTeams: string[]
  highlight: string
}

export interface Product {
  id?: number
  brand: string
  productType: string
  cycleType: string | null
  cycleTypeWeb: string
  category: ProductCategory
  segment: string | null
  rangeName: string
  internalRange: string | null
  slug: string
  cai: string
  eanCode: string | null
  mspnCode: string | null
  upcCode: string | null
  marketPerimeter: string | null
  designation: string
  internalDesignation: string | null
  webDiameterMm: string | null
  webDiameterInch: string | null
  webWidthMm: string | null
  webWidthInch: string | null
  widthEtrto: string | null
  diameterEtrto: string | null
  rimType: string | null
  bead: string | null
  fitting: string | null
  tpi: string | null
  minPressureBar: number | null
  maxPressureBar: number | null
  minPressurePsi: number | null
  maxPressurePsi: number | null
  recommendedInnerTube: string | null
  sidewallType: string | null
  sidewallColor: string | null
  treadPatternColor: string | null
  labelType: string | null
  useCases: string[]
  terrainTypes: string[]
  technologies: string[]
  rubberTechnologies: string[]
  casingTechnologies: string[]
  treadPatternTechnologies: string[]
  reinforcementTechnologies: string[]
  eBikeTechnologies: string[]
  eBikeReady: boolean
  tubelessReady: boolean
  reflectiveStrip: boolean
  weightG: number | null
  discontinuedDate: string | null
  headline: string
  description: string
  imageKey: string
  priceCents: number
  stock: number
  currency: 'EUR'
  proStats: ProductProStats
  createdAt?: string
  updatedAt?: string
}
