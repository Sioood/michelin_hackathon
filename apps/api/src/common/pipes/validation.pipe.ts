import { BadRequestException, ValidationPipe } from '@nestjs/common'

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    exceptionFactory: (errors) =>
      new BadRequestException({
        errors: errors.map((error) => ({
          constraints: error.constraints ?? {},
          field: error.property,
        })),
        message: 'Validation failed',
      }),
    forbidNonWhitelisted: true,
    transform: true,
    whitelist: true,
  })
}
