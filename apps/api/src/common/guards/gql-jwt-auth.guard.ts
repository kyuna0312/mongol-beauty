import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';
import { getAccessTokenFromRequest } from '../../auth/auth-cookie';

/** Requires a valid Bearer token and sets `req.user`. */
@Injectable()
export class GqlJwtAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    const token = getAccessTokenFromRequest(req);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    const user = await this.authService.validateAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    req.user = user;
    return true;
  }
}
