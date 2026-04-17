import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { join } from 'path';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { PaymentModule } from './payment/payment.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { DateTimeScalar } from './scalars/date-time.scalar';
import { HealthModule } from './health/health.module';
import depthLimit from 'graphql-depth-limit';
import { DataloaderModule } from './common/dataloaders/dataloader.module';
import { ProductLoader } from './common/dataloaders/product.loader';
import { CategoryLoader } from './common/dataloaders/category.loader';
import { formatGraphqlError } from './common/graphql/graphql-format-error';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { CartModule } from './cart/cart.module';
import { ContentModule } from './content/content.module';
import type { GraphqlContext } from './types/graphql-context';
import type { Request, Response } from 'express';
import { InternalResilienceModule } from './common/internal-resilience.module';
import { PrometheusModule } from './common/prometheus/prometheus.module';

const serviceMode = process.env.SERVICE_MODE || 'gateway';
const isGateway = serviceMode === 'gateway';
const isOrderService = serviceMode === 'order';
const isPaymentService = serviceMode === 'payment';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),        // apps/api/.env (when running from apps/api)
        join(process.cwd(), '..', '.env'),  // Root .env
      ],
      validate: (config) => {
        // Basic validation - full validation in production
        if (process.env.NODE_ENV === 'production') {
          const { validate } = require('./common/config/env.validation');
          return validate(config);
        }
        return config;
      },
    }),
    PrometheusModule,
    InternalResilienceModule,
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const syncEnv = process.env.DB_SYNCHRONIZE;
        const synchronize =
          syncEnv === 'true'
            ? true
            : syncEnv === 'false'
              ? false
              : process.env.NODE_ENV !== 'production';

        const config = {
          type: 'postgres' as const,
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'mongol_beauty',
          synchronize,
          logging: process.env.NODE_ENV === 'development',
          retryAttempts: 10,
          retryDelay: 3000,
          autoLoadEntities: true,
          // Connection pool settings
          extra: {
            max: 10, // Maximum pool size
            min: 2,  // Minimum pool size
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
          },
          // Additional connection options
          options: {
            connect_timeout: 10,
          },
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Database:', config.host, config.port, config.database);
        }
        
        return config;
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttlRaw = parseInt(String(config.get('THROTTLE_TTL', 60_000)), 10);
        const limitRaw = parseInt(String(config.get('THROTTLE_LIMIT', 100)), 10);
        return [
          {
            ttl: Number.isFinite(ttlRaw) ? ttlRaw : 60_000,
            limit: Number.isFinite(limitRaw) ? limitRaw : 100,
          },
        ];
      },
    }),
    ...(isGateway
      ? [
          GraphQLModule.forRootAsync<ApolloDriverConfig>({
            driver: ApolloDriver,
            imports: [DataloaderModule],
            inject: [ProductLoader, CategoryLoader],
            useFactory: (productLoader: ProductLoader, categoryLoader: CategoryLoader) => ({
              autoSchemaFile: process.env.NODE_ENV === 'production'
                ? join(process.cwd(), 'apps/api/dist/schema.gql')
                : join(process.cwd(), 'src/schema.gql'),
              sortSchema: true,
              playground: process.env.NODE_ENV !== 'production',
              introspection: process.env.NODE_ENV !== 'production',
              context: ({ req, res }: { req: Request; res?: Response }): GraphqlContext => ({
                req,
                res,
                loaders: {
                  product: productLoader.createLoader(),
                  category: categoryLoader.createLoader(),
                },
              }),
              formatError: formatGraphqlError,
              cache: 'bounded',
              validationRules: [depthLimit(10)],
              fieldResolverEnhancers: ['interceptors'],
            }),
          }),
          ProductModule,
          CategoryModule,
          OrderModule,
          PaymentModule,
          UserModule,
          AdminModule,
          AuthModule,
          CartModule,
          ContentModule,
        ]
      : []),
    ...(isOrderService ? [OrderModule] : []),
    ...(isPaymentService ? [OrderModule, PaymentModule] : []),
    HealthModule,
    ...(isGateway ? [DataloaderModule] : []),
  ],
  providers: [
    DateTimeScalar,
    { provide: APP_GUARD, useClass: GqlThrottlerGuard },
  ],
})
export class AppModule {}
