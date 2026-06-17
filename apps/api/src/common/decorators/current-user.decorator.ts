import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import type { PublicUserDto } from '../../users/users.service'
import type { Request } from 'express'

interface RequestWithUser extends Request {
  user?: PublicUserDto
}

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<RequestWithUser>()

  return request.user
})
