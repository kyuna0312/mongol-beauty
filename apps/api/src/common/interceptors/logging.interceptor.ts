import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Check if this is an HTTP context
    const contextType = context.getType();
    if (contextType !== 'http') {
      // Not an HTTP request (e.g., GraphQL schema generation), skip logging
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    
    // Check if request exists and has required properties
    if (!request || !request.method || !request.url) {
      return next.handle();
    }

    const { method, url } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        if (responseTime > 1000) {
          this.logger.warn(`Slow request: ${method} ${url} took ${responseTime}ms`);
        }
      }),
    );
  }
}
