import { Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { PrometheusMetricsService } from './prometheus/prometheus-metrics.service';

type ServiceName = 'order-service' | 'payment-service';
type CircuitState = 'closed' | 'open';

export interface CircuitStats {
  state: CircuitState;
  openedAt: number | null;
  consecutiveFailures: number;
  totalRequests: number;
  totalFailures: number;
  totalTimeouts: number;
}

@Injectable()
export class InternalServiceResilienceService implements OnModuleInit {
  constructor(@Optional() private readonly metrics?: PrometheusMetricsService) {}

  onModuleInit() {
    this.syncCircuitMetrics();
  }

  private readonly failThreshold = Number(process.env.INTERNAL_CB_FAIL_THRESHOLD || 5);
  private readonly cooldownMs = Number(process.env.INTERNAL_CB_COOLDOWN_MS || 15000);
  private readonly circuits: Record<ServiceName, CircuitStats> = {
    'order-service': {
      state: 'closed',
      openedAt: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0,
      totalTimeouts: 0,
    },
    'payment-service': {
      state: 'closed',
      openedAt: null,
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0,
      totalTimeouts: 0,
    },
  };

  canRequest(service: ServiceName): boolean {
    const circuit = this.circuits[service];
    if (circuit.state === 'closed') return true;
    if (!circuit.openedAt) return false;
    const cooledDown = Date.now() - circuit.openedAt >= this.cooldownMs;
    if (cooledDown) {
      circuit.state = 'closed';
      circuit.openedAt = null;
      circuit.consecutiveFailures = 0;
      this.syncCircuitMetrics();
      return true;
    }
    return false;
  }

  private syncCircuitMetrics() {
    this.metrics?.syncCircuitFromStats(this.circuits);
  }

  recordSuccess(service: ServiceName) {
    const circuit = this.circuits[service];
    circuit.totalRequests += 1;
    circuit.consecutiveFailures = 0;
    circuit.state = 'closed';
    circuit.openedAt = null;
    this.syncCircuitMetrics();
  }

  recordFailure(service: ServiceName, isTimeout = false) {
    const circuit = this.circuits[service];
    circuit.totalRequests += 1;
    circuit.totalFailures += 1;
    circuit.consecutiveFailures += 1;
    if (isTimeout) {
      circuit.totalTimeouts += 1;
    }
    if (circuit.consecutiveFailures >= this.failThreshold) {
      circuit.state = 'open';
      circuit.openedAt = Date.now();
    }
    this.syncCircuitMetrics();
  }

  snapshot() {
    return {
      threshold: this.failThreshold,
      cooldownMs: this.cooldownMs,
      services: this.circuits,
    };
  }
}
