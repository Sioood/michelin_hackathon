import { Module } from '@nestjs/common'
import { SequelizeModule } from '@nestjs/sequelize'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ProductsModule } from './products/products.module'

@Module({
  controllers: [AppController],
  imports: [
    SequelizeModule.forRoot({
      autoLoadModels: true,
      database: process.env.DB_NAME ?? 'michelin_hackathon',
      dialect: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      password: process.env.DB_PASSWORD ?? 'michelin',
      port: Number.parseInt(process.env.DB_PORT ?? '5432', 10),
      synchronize: true,
      username: process.env.DB_USER ?? 'michelin',
    }),
    ProductsModule,
  ],
  providers: [AppService],
})
export class AppModule {}
