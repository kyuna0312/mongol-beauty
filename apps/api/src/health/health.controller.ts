import { Controller, Get, Optional } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';
import { InternalServiceResilienceService } from '../common/internal-service-resilience.service';
import { PrometheusMetricsService } from '../common/prometheus/prometheus-metrics.service';

@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private resilience: InternalServiceResilienceService,
    @Optional() private readonly metrics?: PrometheusMetricsService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }

  private async checkDependency(name: string, url?: string) {
    if (!url) {
      return { name, status: 'not-configured' };
    }
    const endpoint = `${url.replace(/\/$/, '')}/health/live`;
    const controller = new AbortController();
    const timeoutMs = Number(process.env.INTERNAL_REQUEST_TIMEOUT_MS || 5000);
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(endpoint, { signal: controller.signal });
      clearTimeout(timer);
      return {
        name,
        endpoint,
        status: response.ok ? 'up' : 'down',
        statusCode: response.status,
      };
    } catch (error) {
      clearTimeout(timer);
      return {
        name,
        endpoint,
        status: 'down',
        reason: error instanceof Error ? error.message : 'unknown',
      };
    }
  }

  @Get('ready')
  async ready() {
    const serviceMode = process.env.SERVICE_MODE || 'gateway';
    const dependencies =
      serviceMode === 'gateway'
        ? await Promise.all([
            this.checkDependency('order-service', process.env.ORDER_SERVICE_URL),
            this.checkDependency('payment-service', process.env.PAYMENT_SERVICE_URL),
          ])
        : [];
    if (serviceMode === 'gateway') {
      for (const dep of dependencies) {
        if (dep.status === 'not-configured') {
          this.metrics?.setDependencyHealth(dep.name, null);
        } else {
          this.metrics?.setDependencyHealth(dep.name, dep.status === 'up');
        }
      }
    } else {
      this.metrics?.setDependencyHealth('order-service', null);
      this.metrics?.setDependencyHealth('payment-service', null);
    }
    const hasDownDependency = dependencies.some((dep) => dep.status === 'down');
    return {
      status: hasDownDependency ? 'degraded' : 'ready',
      serviceMode,
      timestamp: new Date().toISOString(),
      dependencies,
      resilience: this.resilience.snapshot(),
    };
  }

  @Get('live')
  live() {
    return { status: 'live', timestamp: new Date().toISOString() };
  }
}
