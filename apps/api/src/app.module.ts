import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { CartModule } from './cart/cart.module'
import { CrossSellModule } from './cross-sell/cross-sell.module'
import { RouletteModule } from './games/roulette/roulette.module'
import { GarageModule } from './garage/garage.module'
import { LoyaltyModule } from './loyalty/loyalty.module'
import { OrdersModule } from './orders/orders.module'
import { PaymentsModule } from './payments/payments.module'
import { ProductsModule } from './products/products.module'
import { SearchModule } from './search/search.module'
import { UsersModule } from './users/users.module'

@Module({
  controllers: [AppController],
  imports: [
    SequelizeModule.forRoot({
      autoLoadModels: true,
      database: process.env.DB_NAME ?? 'michelin_hackathon',
      dialect: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      logging: false,
      password: process.env.DB_PASSWORD ?? 'michelin',
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      sync: { alter: true },
      synchronize: true,
      username: process.env.DB_USER ?? 'michelin',
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    SearchModule,
    GarageModule,
    LoyaltyModule,
    CrossSellModule,
    RouletteModule,
  ],
  providers: [AppService],
})
export class AppModule {}
