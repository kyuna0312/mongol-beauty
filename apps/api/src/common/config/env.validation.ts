import { plainToInstance, Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  @Min(1)
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsNumber()
  @Min(1)
  PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string;

  /** Required when NODE_ENV=production */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  JWT_SECRET?: string;

  /** Required when NODE_ENV=production */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  INTERNAL_SERVICE_SECRET?: string;

  /** Required when NODE_ENV=production */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  INTERNAL_SERVICE_TOKEN?: string;

  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Transform(({ value }) => (value !== undefined ? parseInt(String(value), 10) : 60_000))
  THROTTLE_TTL?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => (value !== undefined ? parseInt(String(value), 10) : 100))
  THROTTLE_LIMIT?: number;

  @IsOptional()
  @IsString()
  RECEIPT_STORAGE_DRIVER?: string;

  @IsOptional()
  @IsString()
  RECEIPT_UPLOAD_DIR?: string;

  @IsOptional()
  @IsString()
  RECEIPT_PUBLIC_BASE_PATH?: string;

  @IsOptional()
  @IsNumber()
  @Min(1024)
  @Transform(({ value }) => (value !== undefined ? parseInt(String(value), 10) : 5 * 1024 * 1024))
  RECEIPT_MAX_BYTES?: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  if (validatedConfig.NODE_ENV === 'production') {
    const secret = String(config.JWT_SECRET ?? '').trim();
    if (!secret) {
      throw new Error('JWT_SECRET is required in production');
    }
    const internalSecret = String(config.INTERNAL_SERVICE_SECRET ?? '').trim();
    if (!internalSecret) {
      throw new Error('INTERNAL_SERVICE_SECRET is required in production');
    }
    const internalToken = String(config.INTERNAL_SERVICE_TOKEN ?? '').trim();
    if (!internalToken) {
      throw new Error('INTERNAL_SERVICE_TOKEN is required in production');
    }
  }

  const receiptDriver = String(config.RECEIPT_STORAGE_DRIVER ?? 'local').trim().toLowerCase();
  if (!['local', 'r2'].includes(receiptDriver)) {
    throw new Error(`Invalid RECEIPT_STORAGE_DRIVER: "${receiptDriver}". Valid values: local, r2`);
  }

  return validatedConfig;
}
