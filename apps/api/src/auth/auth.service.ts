import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { compare, hash } from 'bcrypt'

import { LoyaltyService } from '../loyalty/loyalty.service'
import { UsersService } from '../users/users.service'

import type { LoginDto } from './dto/login.dto'
import type { RegisterDto } from './dto/register.dto'
import type { JwtPayload } from './jwt-payload'
import type { User } from '../users/user.model'
import type { PublicUserDto } from '../users/users.service'

export interface AuthResponseDto {
  accessToken: string
  user: PublicUserDto
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly loyaltyService: LoyaltyService,
    private readonly usersService: UsersService,
  ) {}

  async register(input: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.usersService.create({
      email: input.email,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      passwordHash: await hash(input.password, 12),
    })

    if (user.id === undefined) {
      throw new BadRequestException('Invalid user')
    }

    await this.loyaltyService.bootstrapForRegistration(user.id, input.referralCode)

    return this.createAuthResponse(user)
  }

  async login(input: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(input.email)

    if (user === null) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const passwordMatches = await compare(input.password, user.passwordHash)

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.createAuthResponse(user)
  }

  private createAuthResponse(user: User): AuthResponseDto {
    if (user.id === undefined) {
      throw new UnauthorizedException('Invalid user')
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: this.usersService.toPublicUser(user),
    }
  }
}
