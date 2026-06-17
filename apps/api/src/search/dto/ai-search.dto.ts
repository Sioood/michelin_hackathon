import { IsString, MaxLength, MinLength } from 'class-validator'

export class AiSearchDto {
  @IsString()
  @MaxLength(500)
  @MinLength(3)
  declare query: string
}
