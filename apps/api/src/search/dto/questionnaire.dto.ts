import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator'

import type { ProductCategory } from '../../products/product.model'
import type { SearchTerrain } from '../search.types'

const categories = [
  'commuting-tour',
  'e-bike',
  'gravel',
  'inner-tubes',
  'kids',
  'mtb',
  'road',
] satisfies ProductCategory[]

const terrains = ['CITY', 'GRAVEL', 'MIXED', 'MTB', 'ROAD'] satisfies SearchTerrain[]

const priorities = ['comfort', 'durability', 'performance'] as const

export class QuestionnaireDto {
  @IsIn(categories)
  @IsOptional()
  declare category?: ProductCategory

  @IsOptional()
  @IsString()
  @MaxLength(24)
  declare diameter?: string

  @IsBoolean()
  @IsOptional()
  declare eBikeReady?: boolean

  @IsIn(priorities)
  @IsOptional()
  declare priority?: 'comfort' | 'durability' | 'performance'

  @IsIn(terrains)
  @IsOptional()
  declare terrain?: SearchTerrain

  @IsBoolean()
  @IsOptional()
  declare tubelessReady?: boolean
}
