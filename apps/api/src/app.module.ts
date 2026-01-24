import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const config = {
          type: 'postgres' as const,
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'mongol_beauty',
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          synchronize: process.env.NODE_ENV !== 'production',
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
        
        // Log connection details in development
        if (process.env.NODE_ENV === 'development') {
          console.log('🔌 Database connection config:', {
            host: config.host,
            port: config.port,
            database: config.database,
            username: config.username,
          });
        }
        
        return config;
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time window in milliseconds
      limit: 100, // Max requests per window
    }]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req }) => ({ req }),
      // Performance optimizations
      cache: 'bounded', // Enable query result caching
      // Query depth limit to prevent deep nested queries
      validationRules: [
        depthLimit(10), // Maximum query depth of 10
      ],
      // Optimize schema generation
      fieldResolverEnhancers: ['interceptors'],
    }),
    ProductModule,
    CategoryModule,
    OrderModule,
    PaymentModule,
    UserModule,
    AdminModule,
    AuthModule,
    HealthModule,
  ],
  providers: [DateTimeScalar],
})
export class AppModule {}
