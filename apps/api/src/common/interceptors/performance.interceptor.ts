import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowQueryThreshold = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<'http' | 'graphql' | 'rpc' | 'ws'>();
    let operationName = 'anonymous';

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      const info = ctx.getInfo();
      operationName = info?.operation?.name?.value || info?.fieldName || 'anonymous';
    } else if (contextType === 'http') {
      const request = context.switchToHttp().getRequest();
      if (request?.method && request?.url) {
        operationName = `${request.method} ${request.url}`;
      }
    } else {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          if (duration > this.slowQueryThreshold) {
            this.logger.warn(
              `Slow request detected: ${operationName} took ${duration}ms`,
            );
          }
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `Request failed: ${operationName} after ${duration}ms`,
          );
        },
      }),
    );
  }
}
