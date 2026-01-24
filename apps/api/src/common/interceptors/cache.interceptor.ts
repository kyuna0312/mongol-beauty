import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';

// Simple in-memory cache (for production, use Redis)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Only cache GraphQL queries, not mutations
    const ctx = GqlExecutionContext.create(context);
    const info = ctx.getInfo();
    
    if (!info || info.operation.operation !== 'query') {
      return next.handle();
    }

    const cacheKey = this.generateCacheKey(info);
    const cached = cache.get(cacheKey);

    // Check if cache is valid
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return of(cached.data);
    }

    return next.handle().pipe(
      tap((data) => {
        // Cache successful responses
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
        
        // Clean up old cache entries periodically
        if (cache.size > 100) {
          this.cleanCache();
        }
      }),
    );
  }

  private generateCacheKey(info: any): string {
    const operationName = info.operation.name?.value || 'anonymous';
    const selectionSet = JSON.stringify(info.fieldNodes);
    return `${operationName}:${JSON.stringify(selectionSet)}`;
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  }
}
