export function formatPrice(cents: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    currency,
    style: 'currency',
  }).format(cents / 100)
}

export function getProductDimension(product: {
  webDiameterInch: string | null
  webDiameterMm: string | null
  webWidthInch: string | null
  webWidthMm: string | null
}): string {
  const diameter = product.webDiameterMm ?? product.webDiameterInch
  const width = product.webWidthMm ?? product.webWidthInch

  if (diameter === null && width === null) {
    return 'Dimension non communiquee'
  }

  return [diameter, width].filter(Boolean).join(' x ')
}
