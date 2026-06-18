import type { Product, ProductCategory } from '~/types/product'
import type { SelectItem } from '~ui/app/components/Form/Select/index.vue'


export function buildDiameterSelectItems(
  products: Product[],
  category?: ProductCategory,
): SelectItem[] {
  const values = new Set<string>()

  for (const product of products) {
    if (category !== undefined && product.category !== category) {
      continue
    }

    const diameter = product.webDiameterMm ?? product.webDiameterInch
    if (diameter) {
      values.add(diameter)
    }
  }

  return [...values]
    .sort((first, second) => first.localeCompare(second, undefined, { numeric: true }))
    .map((value) => ({ label: value, value }))
}
