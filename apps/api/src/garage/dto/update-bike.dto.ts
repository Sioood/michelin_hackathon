import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

import type { BikeType } from '../bike.model'

const bikeTypes = ['city', 'e-bike', 'gravel', 'mtb', 'road'] satisfies BikeType[]

export class UpdateBikeDto {
  @IsInt()
  @Max(50000)
  @Min(0)
  @IsOptional()
  declare annualDistanceKm?: number

  @IsOptional()
  @IsString()
  @MaxLength(80)
  declare brand?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  declare model?: string

  @IsOptional()
  @IsString()
  @MaxLength(120)
  declare name?: string

  @IsIn(bikeTypes)
  @IsOptional()
  declare type?: BikeType

  @IsOptional()
  @IsString()
  @MaxLength(24)
  declare wheelDiameter?: string
}
