import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';
import { getAccessTokenFromRequest } from '../../auth/auth-cookie';

/** Attaches `req.user` when a valid Bearer token is present; otherwise `req.user` is null. */
@Injectable()
export class GqlOptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    req.user = null;
    const token = getAccessTokenFromRequest(req);
    if (!token) {
      return true;
    }
    req.user = await this.authService.validateAccessToken(token);
    return true;
  }
}
