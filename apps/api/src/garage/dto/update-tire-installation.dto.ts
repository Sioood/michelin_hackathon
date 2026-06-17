import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

import type { TirePosition } from '../bike-tire-installation.model'

const positions = ['both', 'front', 'rear'] satisfies TirePosition[]

export class UpdateTireInstallationDto {
  @IsInt()
  @Max(200000)
  @Min(0)
  @IsOptional()
  declare currentDistanceKm?: number

  @IsInt()
  @Max(200000)
  @Min(0)
  @IsOptional()
  declare distanceKmAtInstall?: number

  @IsDateString()
  @IsOptional()
  declare installedAt?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  declare notes?: string

  @IsIn(positions)
  @IsOptional()
  declare position?: TirePosition
}
