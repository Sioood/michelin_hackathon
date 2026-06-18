import { IsString, MaxLength, MinLength } from 'class-validator'

export class RedeemCodeDto {
  @IsString()
  @MinLength(4)
  @MaxLength(48)
  declare code: string
}
