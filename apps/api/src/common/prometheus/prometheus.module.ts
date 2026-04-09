import { Global, Module } from '@nestjs/common';
import { PrometheusMetricsService } from './prometheus-metrics.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  controllers: [MetricsController],
  providers: [PrometheusMetricsService],
  exports: [PrometheusMetricsService],
})
export class PrometheusModule {}
