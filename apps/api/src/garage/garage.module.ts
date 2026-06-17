import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { OrderItem } from '../orders/order-item.model'
import { Order } from '../orders/order.model'
import { ProductsModule } from '../products/products.module'

import { BikeTireInstallation } from './bike-tire-installation.model'
import { Bike } from './bike.model'
import { GarageController } from './garage.controller'
import { GarageService } from './garage.service'
import { GarageReminderService } from './reminder.service'
import { GarageSuggestionsService } from './suggestions.service'

@Module({
  controllers: [GarageController],
  imports: [
    SequelizeModule.forFeature([Bike, BikeTireInstallation, Order, OrderItem]),
    ProductsModule,
  ],
  providers: [GarageService, GarageReminderService, GarageSuggestionsService],
})
export class GarageModule {}
