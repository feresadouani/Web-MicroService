import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { JwtUser } from './jwt.strategy';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }
    const req = context.switchToHttp().getRequest<{ user?: JwtUser }>();
    const user = req.user;
    if (!user?.roles?.length) {
      throw new ForbiddenException('Missing roles');
    }
    const has = required.some((r) =>
      user.roles.includes(r.toUpperCase().replace(/-/g, '_')),
    );
    if (!has) {
      throw new ForbiddenException('Insufficient role');
    }
    return true;
  }
}
