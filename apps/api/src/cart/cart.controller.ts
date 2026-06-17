import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'

import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard'

import { CartService } from './cart.service'
import { AddCartItemDto } from './dto/add-cart-item.dto'
import { UpdateCartItemDto } from './dto/update-cart-item.dto'

import type { CartDto } from './cart.service'
import type { PublicUserDto } from '../users/users.service'
import type { Request } from 'express'

@Controller('cart')
@UseGuards(OptionalJwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() request: Request): Promise<CartDto> {
    return this.cartService.getCart(this.getIdentity(request))
  }

  @Post('items')
  addItem(@Body() input: AddCartItemDto, @Req() request: Request): Promise<CartDto> {
    return this.cartService.addItem(this.getIdentity(request), input.productId, input.quantity)
  }

  @Patch('items/:id')
  updateItem(
    @Body() input: UpdateCartItemDto,
    @Param('id', ParseIntPipe) itemId: number,
    @Req() request: Request,
  ): Promise<CartDto> {
    return this.cartService.updateItem(this.getIdentity(request), itemId, input.quantity)
  }

  @Delete('items/:id')
  removeItem(@Param('id', ParseIntPipe) itemId: number, @Req() request: Request): Promise<CartDto> {
    return this.cartService.removeItem(this.getIdentity(request), itemId)
  }

  private getIdentity(request: Request): { guestId: string | null; user: PublicUserDto | null } {
    const guestId = request.header('x-guest-cart-id')
    const user = request.user as PublicUserDto | undefined

    return {
      guestId: guestId ?? null,
      user: user ?? null,
    }
  }
}
