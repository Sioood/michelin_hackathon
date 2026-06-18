import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { LoyaltyModule } from '../loyalty/loyalty.module'
import { UsersModule } from '../users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

import type { JwtModuleOptions } from '@nestjs/jwt'

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '24h') as NonNullable<
  JwtModuleOptions['signOptions']
>['expiresIn']

@Module({
  controllers: [AuthController],
  imports: [
    LoyaltyModule,
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
