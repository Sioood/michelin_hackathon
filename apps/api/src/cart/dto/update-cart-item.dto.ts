import { IsInt, Max, Min } from 'class-validator'

export class UpdateCartItemDto {
  @IsInt()
  @Max(99)
  @Min(1)
  declare quantity: number
}
