import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';
export type InternalServiceName = 'order-service' | 'payment-service';

/** Minimal circuit state for metrics (avoids circular imports with resilience). */
export type CircuitStateForMetrics = {
  state: 'closed' | 'open';
};

export type InternalOutcome =
  | 'success'
  | 'error'
  | 'timeout'
  | 'circuit_blocked';

@Injectable()
export class PrometheusMetricsService implements OnModuleInit {
  readonly register = new Registry();

  private readonly internalDuration: Histogram<'service'>;
  private readonly internalRequests: Counter<'service' | 'outcome'>;
  private readonly internalRetries: Counter<'service'>;
  private readonly circuitOpen: Gauge<'service'>;
  private readonly dependencyUp: Gauge<'name'>;
  private readonly gatewayUp: Gauge;

  constructor() {
    this.internalDuration = new Histogram({
      name: 'mb_internal_http_request_duration_seconds',
      help: 'Latency of outbound HTTP calls to internal order/payment services',
      labelNames: ['service'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10],
      registers: [this.register],
    });

    this.internalRequests = new Counter({
      name: 'mb_internal_requests_total',
      help: 'Count of internal outbound HTTP attempts and outcomes',
      labelNames: ['service', 'outcome'],
      registers: [this.register],
    });

    this.internalRetries = new Counter({
      name: 'mb_internal_retries_total',
      help: 'Retry attempts after 5xx from internal services',
      labelNames: ['service'],
      registers: [this.register],
    });

    this.circuitOpen = new Gauge({
      name: 'mb_internal_circuit_breaker_open',
      help: '1 if circuit breaker is open for the internal service',
      labelNames: ['service'],
      registers: [this.register],
    });

    this.dependencyUp = new Gauge({
      name: 'mb_health_dependency_up',
      help: 'Last /health/ready probe: 1=up, 0=down, not-configured omitted',
      labelNames: ['name'],
      registers: [this.register],
    });

    this.gatewayUp = new Gauge({
      name: 'mb_up',
      help: 'Gateway process is up (always 1 when metrics are served)',
      registers: [this.register],
    });
  }

  onModuleInit() {
    collectDefaultMetrics({ register: this.register, prefix: 'mb_' });
    this.gatewayUp.set(1);
  }

  syncCircuitFromStats(services: Record<InternalServiceName, CircuitStateForMetrics>) {
    (['order-service', 'payment-service'] as const).forEach((name) => {
      const c = services[name];
      this.circuitOpen.set({ service: name }, c.state === 'open' ? 1 : 0);
    });
  }

  recordInternalOutcome(service: InternalServiceName, outcome: InternalOutcome, durationSeconds?: number) {
    this.internalRequests.inc({ service, outcome });
    if (durationSeconds !== undefined && durationSeconds >= 0) {
      this.internalDuration.observe({ service }, durationSeconds);
    }
  }

  recordRetry(service: InternalServiceName) {
    this.internalRetries.inc({ service });
  }

  async getMetricsText(): Promise<string> {
    return this.register.metrics();
  }

  get contentType(): string {
    return this.register.contentType;
  }

  setDependencyHealth(name: string, up: boolean | null) {
    if (up === null) {
      this.dependencyUp.remove({ name });
      return;
    }
    this.dependencyUp.set({ name }, up ? 1 : 0);
  }
}
