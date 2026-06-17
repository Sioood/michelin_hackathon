import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'

import type { AuthResponseDto } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() input: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(input)
  }

  @Post('login')
  login(@Body() input: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(input)
  }
}
