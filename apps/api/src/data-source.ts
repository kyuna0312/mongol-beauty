import 'reflect-metadata';
import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Category } from './category/category.entity';
import { Product } from './product/product.entity';
import { Order } from './order/order.entity';
import { OrderItem } from './order/order-item.entity';

// Load apps/api/.env then repo root .env (CLI is usually run from apps/api)
config({ path: join(__dirname, '../.env'), quiet: true });
config({ path: join(__dirname, '../../../.env'), quiet: true });

/**
 * TypeORM CLI data source (migrations). Keep entities in sync with app modules.
 * Usage (from apps/api): npm run migration:run
 */
/** Default export only — TypeORM CLI requires a single DataSource export. */
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'mongol_beauty',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Category, Product, Order, OrderItem],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
