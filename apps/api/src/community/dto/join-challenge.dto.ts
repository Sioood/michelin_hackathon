import { IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator'

export class JoinChallengeDto {
  @IsNumber()
  @Max(10_000)
  @Min(0)
  declare score: number

  @IsOptional()
  @IsString()
  @MaxLength(220)
  declare note?: string
}
