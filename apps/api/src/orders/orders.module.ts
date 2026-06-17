import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { CartModule } from '../cart/cart.module'

import { OrderItem } from './order-item.model'
import { Order } from './order.model'
import { OrdersController } from './orders.controller'
import { OrdersService } from './orders.service'

@Module({
  controllers: [OrdersController],
  exports: [OrdersService],
  imports: [SequelizeModule.forFeature([Order, OrderItem]), CartModule],
  providers: [OrdersService],
})
export class OrdersModule {}
