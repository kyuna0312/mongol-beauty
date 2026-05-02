import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { getAccessTokenFromRequest } from '../../auth/auth-cookie';
import type { Request } from 'express';

/** HTTP (REST) guard: requires a valid Bearer token and sets `req.user`. */
@Injectable()
export class HttpJwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = getAccessTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    const user = await this.authService.validateAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    (req as any).user = user;
    return true;
  }
}
