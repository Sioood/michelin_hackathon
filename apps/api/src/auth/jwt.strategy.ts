import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UsersService } from '../users/users.service'

import type { JwtPayload } from './jwt-payload'
import type { PublicUserDto } from '../users/users.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    })
  }

  async validate(payload: JwtPayload): Promise<PublicUserDto> {
    const user = await this.usersService.findById(payload.sub)

    return this.usersService.toPublicUser(user)
  }
}
