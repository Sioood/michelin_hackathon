import { IsString, MaxLength, MinLength } from 'class-validator'

export class ReportPostDto {
  @IsString()
  @MaxLength(220)
  @MinLength(3)
  declare reason: string
}
