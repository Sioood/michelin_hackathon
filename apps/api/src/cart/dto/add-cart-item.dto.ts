import { IsInt, Max, Min } from 'class-validator'

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  declare productId: number

  @IsInt()
  @Max(99)
  @Min(1)
  declare quantity: number
}
