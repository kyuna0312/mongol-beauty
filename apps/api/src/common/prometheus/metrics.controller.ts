import { Controller, Get, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { PrometheusMetricsService } from './prometheus-metrics.service';

@SkipThrottle()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheus: PrometheusMetricsService) {}

  @Get()
  async metrics(@Res() res: Response): Promise<void> {
    const body = await this.prometheus.getMetricsText();
    res.setHeader('Content-Type', this.prometheus.contentType);
    res.setHeader('Cache-Control', 'no-store');
    res.send(body);
  }
}
