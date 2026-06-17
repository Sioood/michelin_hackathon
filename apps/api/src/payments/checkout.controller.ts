import { Controller, Post, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { PaymentsService } from './payments.service'

import type { CheckoutSessionDto } from './payments.service'
import type { PublicUserDto } from '../users/users.service'

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('session')
  createSession(@CurrentUser() user: PublicUserDto): Promise<CheckoutSessionDto> {
    return this.paymentsService.createCheckoutSession(user)
  }
}
