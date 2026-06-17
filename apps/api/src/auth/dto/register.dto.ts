import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  @IsEmail()
  declare email: string

  @IsString()
  @MinLength(8)
  declare password: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  declare firstName?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  declare lastName?: string
}
