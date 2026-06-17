import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { AuthModule } from '../auth/auth.module'
import { ProductsModule } from '../products/products.module'

import { CartItem } from './cart-item.model'
import { CartController } from './cart.controller'
import { Cart } from './cart.model'
import { CartService } from './cart.service'

@Module({
  controllers: [CartController],
  exports: [CartService],
  imports: [SequelizeModule.forFeature([Cart, CartItem]), ProductsModule, AuthModule],
  providers: [CartService],
})
export class CartModule {}
