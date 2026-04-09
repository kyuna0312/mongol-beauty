import { Global, Module } from '@nestjs/common';
import { InternalServiceResilienceService } from './internal-service-resilience.service';

@Global()
@Module({
  providers: [InternalServiceResilienceService],
  exports: [InternalServiceResilienceService],
})
export class InternalResilienceModule {}
