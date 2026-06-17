import type {
  ProductAttributes,
  ProductCategory,
  ProductProStats,
  ProductSeed,
} from './product.model'

const categoryBasePriceCents: Record<ProductCategory, number> = {
  'commuting-tour': 2990,
  'e-bike': 4490,
  gravel: 5490,
  'inner-tubes': 890,
  kids: 1990,
  mtb: 4990,
  road: 5990,
}

const categoryHighlights: Record<ProductCategory, string> = {
  'commuting-tour': 'Endurance urbaine et fiabilite quotidienne',
  'e-bike': 'Renfort adapte aux usages electriques',
  gravel: 'Grip et rendement sur parcours mixtes',
  'inner-tubes': 'Compatibilite chambre a air Michelin',
  kids: 'Controle rassurant pour jeunes cyclistes',
  mtb: 'Motricite inspiree des lignes competition',
  road: 'Rendement route inspire des pelotons pros',
}

function categoryPriceOffset(product: ProductSeed): number {
  const weightOffset =
    product.weightG === null ? 0 : Math.min(Math.max(product.weightG - 350, 0), 1200)
  const tubelessOffset = product.tubelessReady ? 700 : 0
  const eBikeOffset = product.eBikeReady ? 500 : 0
  const premiumOffset = product.segment?.includes('PREMIUM') ? 1_000 : 0

  return Math.round(weightOffset / 10) * 10 + tubelessOffset + eBikeOffset + premiumOffset
}

export function createProStats(product: ProductSeed): ProductProStats {
  const techScore =
    product.technologies.length +
    product.rubberTechnologies.length +
    product.casingTechnologies.length +
    product.reinforcementTechnologies.length

  return {
    highlight: categoryHighlights[product.category],
    podiums: Math.max(2, techScore * 3 + (product.tubelessReady ? 4 : 0)),
    proTeams:
      product.category === 'inner-tubes' ? [] : ['Michelin Factory Racing', 'Michelin Riders Lab'],
    victories: Math.max(1, techScore + (product.category === 'road' ? 6 : 2)),
  }
}

export function enrichProductSeed(product: ProductSeed): ProductAttributes {
  return {
    ...product,
    currency: product.currency ?? 'EUR',
    priceCents:
      product.priceCents ?? categoryBasePriceCents[product.category] + categoryPriceOffset(product),
    proStats: product.proStats ?? createProStats(product),
    stock: product.stock ?? (product.discontinuedDate === null ? 24 : 8),
  }
}
