import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class UpdateReviewDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number

  @IsString()
  @MaxLength(160)
  @IsOptional()
  title?: string

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  body?: string
}
