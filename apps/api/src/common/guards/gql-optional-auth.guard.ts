import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../../auth/auth.service';

/** Attaches `req.user` when a valid Bearer token is present; otherwise `req.user` is null. */
@Injectable()
export class GqlOptionalAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const req = ctx.getContext().req;
    req.user = null;
    const authHeader = req.headers?.authorization as string | undefined;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    if (!token) {
      return true;
    }
    req.user = await this.authService.validateAccessToken(token);
    return true;
  }
}
