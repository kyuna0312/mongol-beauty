import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private readonly slowQueryThreshold = 1000; // 1 second

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    
    if (!info) {
      return next.handle();
    }

    const operationName = info.operation.name?.value || 'anonymous';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          if (duration > this.slowQueryThreshold) {
            this.logger.warn(
              `Slow GraphQL query detected: ${operationName} took ${duration}ms`,
            );
          }
        },
        error: () => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `GraphQL query failed: ${operationName} after ${duration}ms`,
          );
        },
      }),
    );
  }
}
