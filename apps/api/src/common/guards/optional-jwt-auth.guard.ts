import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  override async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context)

    return true
  }

  override handleRequest<TUser = unknown>(err: Error | null, user: TUser | false): TUser | null {
    if (err !== null || user === false) {
      return null
    }

    return user
  }
}
