import type { Request, Response } from 'express';
import type DataLoader from 'dataloader';
import type { Product } from '../product/product.entity';
import type { Category } from '../category/category.entity';

export interface GraphqlLoaders {
  /** Batch-load products by id (order line items, nested fields). */
  product: DataLoader<string, Product | null>;
  /** Batch-load categories by id (product.category when not joined). */
  category: DataLoader<string, Category | null>;
}

export interface GraphqlContext {
  req: Request;
  res?: Response;
  loaders: GraphqlLoaders;
}
