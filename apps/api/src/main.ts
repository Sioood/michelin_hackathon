import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { createValidationPipe } from './common/pipes/validation.pipe'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true })
  app.useGlobalPipes(createValidationPipe())
  app.enableCors({
    allowedHeaders: ['Authorization', 'Content-Type', 'x-guest-cart-id'],
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
  })
  await app.listen(process.env.PORT ?? 3001)
}
void bootstrap()
