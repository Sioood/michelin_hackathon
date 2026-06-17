import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common'

import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'

import { OrdersService } from './orders.service'

import type { Order } from './order.model'
import type { PublicUserDto } from '../users/users.service'

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@CurrentUser() user: PublicUserDto): Promise<Order[]> {
    return this.ordersService.findAllForUser(user.id as number)
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: PublicUserDto,
    @Param('id', ParseIntPipe) orderId: number,
  ): Promise<Order> {
    return this.ordersService.findForUser(user.id as number, orderId)
  }
}
