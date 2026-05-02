import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

/** HTTP (REST) guard: use after `HttpJwtAuthGuard`. Requires `req.user.isAdmin`. */
@Injectable()
export class HttpAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user = (req as any).user;
    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
