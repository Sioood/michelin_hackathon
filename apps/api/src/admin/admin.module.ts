import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { OrderItem } from '../orders/order-item.model'
import { Order } from '../orders/order.model'
import { Product } from '../products/product.model'

import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'

@Module({
  controllers: [AdminController],
  imports: [SequelizeModule.forFeature([Order, OrderItem, Product])],
  providers: [AdminService],
})
export class AdminModule {}
