import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PerformanceInterceptor } from './common/interceptors/performance.interceptor';
import compression from 'compression';
import crypto from 'crypto';
import express from 'express';
import { join } from 'path';
import { requestContext } from './common/request-context';

const { graphqlUploadExpress } = require('graphql-upload') as {
  graphqlUploadExpress: (options?: {
    maxFileSize?: number;
    maxFiles?: number;
  }) => express.RequestHandler;
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const serviceMode = process.env.SERVICE_MODE || 'gateway';
  const isGateway = serviceMode === 'gateway';
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : ['log', 'error', 'warn', 'debug'],
    ...(isGateway ? { bodyParser: false } : {}),
  });
  
  // Enable compression (gzip/brotli)
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6, // Compression level (1-9)
    threshold: 1024, // Only compress responses > 1KB
  }));

  // Request / trace IDs (ALS for downstream internal hops) + security headers
  app.use((req, res, next) => {
    const requestId = (req.headers['x-request-id'] as string | undefined) || crypto.randomUUID();
    const traceId = (req.headers['x-trace-id'] as string | undefined) || crypto.randomUUID();
    req.headers['x-request-id'] = requestId;
    req.headers['x-trace-id'] = traceId;
    res.setHeader('x-request-id', requestId);
    res.setHeader('x-trace-id', traceId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    requestContext.run({ requestId, traceId }, () => {
      logger.log(`${req.method} ${req.url} [requestId=${requestId}] [traceId=${traceId}]`);
      next();
    });
  });

  // GraphQL multipart file uploads (graphql-upload). Must run before JSON body parsing.
  if (isGateway) {
    app.use(
      '/graphql',
      graphqlUploadExpress({
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 1,
      }),
    );
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  }

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Add logging and performance interceptors
  if (process.env.NODE_ENV === 'development') {
    app.useGlobalInterceptors(new LoggingInterceptor());
  }
  
  if (process.env.NODE_ENV !== 'production') {
    app.useGlobalInterceptors(new PerformanceInterceptor());
  }
  
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  const receiptUploadsDir =
    process.env.RECEIPT_UPLOAD_DIR?.trim() || join(process.cwd(), 'uploads', 'receipts');
  app.use('/uploads/receipts', express.static(receiptUploadsDir));

  const logoUploadsDir =
    process.env.LOGO_UPLOAD_DIR?.trim() || join(process.cwd(), 'uploads', 'logos');
  app.use('/uploads/logos', express.static(logoUploadsDir));
  
  const defaultPort =
    serviceMode === 'order' ? 4010 : serviceMode === 'payment' ? 4020 : 4000;
  const port = Number(process.env.PORT || defaultPort);
  await app.listen(port);
  if (serviceMode === 'gateway') {
    logger.log(`🚀 Gateway GraphQL API running on http://localhost:${port}/graphql`);
  } else {
    logger.log(`🚀 ${serviceMode}-service REST API running on http://localhost:${port}`);
  }
  logger.log(`📊 Service mode: ${serviceMode}`);
  logger.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    logger.log(`✅ Compression enabled`);
    logger.log(`✅ Security headers enabled`);
  }
}

bootstrap();
