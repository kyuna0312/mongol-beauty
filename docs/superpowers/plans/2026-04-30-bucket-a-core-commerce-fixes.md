# Bucket A — Core Commerce Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix admin product CRUD reliability, make products visible on public listing, add delivery fee logic, and add cash payment option.

**Architecture:** Surgical backend changes (entity columns, resolver guard, service logic) paired with matching frontend changes (query fields, UI components). Three additive DB migrations run first. No schema restructuring — all changes extend existing patterns.

**Tech Stack:** NestJS + GraphQL code-first + TypeORM (PostgreSQL 15), React 18 + Apollo Client + Vite + Tailwind

---

## File Map

| File | Change |
|------|--------|
| `apps/api/src/product/product.service.ts` | UUID guard fix in `buildProductsQuery`; null guard in `update` |
| `apps/api/src/product/product.resolver.ts` | `@ResolveField` for `stock` gated by admin context |
| `apps/api/src/content/site-settings.entity.ts` | Add `deliveryFee`, `freeDeliveryThreshold` columns |
| `apps/api/src/content/dto/update-site-settings.input.ts` | Add `deliveryFee?`, `freeDeliveryThreshold?` |
| `apps/api/src/order/order.entity.ts` | Add `deliveryFee` column; `PaymentMethod` enum + `paymentMethod` column |
| `apps/api/src/order/order.service.ts` | Fetch SiteSettings, compute delivery fee, store `paymentMethod`, append cash note |
| `apps/api/src/order/dto/create-order.input.ts` | Add `paymentMethod?: PaymentMethod` |
| `apps/api/src/migrations/1746000000000-AddDeliverySettingsToSiteSettings.ts` | New migration |
| `apps/api/src/migrations/1746000001000-AddDeliveryFeeToOrders.ts` | New migration |
| `apps/api/src/migrations/1746000002000-AddPaymentMethodToOrders.ts` | New migration |
| `apps/web/src/graphql/queries.ts` | Add `deliveryFee`, `freeDeliveryThreshold` to `GET_SITE_SETTINGS`; add `paymentMethod`, `deliveryFee` to `GET_ADMIN_ORDERS` |
| `apps/web/src/graphql/orders.ts` | Add `paymentMethod` to `CREATE_ORDER_SIMPLE` |
| `apps/web/src/features/catalog/pages/ProductsPage.tsx` | Add `returnPartialData: false` to Apollo query options |
| `apps/web/src/features/admin/pages/AdminProductFormPage.tsx` | Add `refetchQueries` to create/update mutations |
| `apps/web/src/features/admin/pages/AdminProductsPage.tsx` | Already calls `refetch()` on delete — no change needed |
| `apps/web/src/features/checkout/pages/CheckoutPage.tsx` | Delivery fee display; payment method selector; conditional receipt |
| `apps/web/src/features/admin/pages/AdminSiteSettingsPage.tsx` | Add `deliveryFee`, `freeDeliveryThreshold` inputs |
| `apps/web/src/features/admin/pages/AdminOrdersPage.tsx` | Payment method badge; amber background for cash orders |

---

## Task 1: ProductService — UUID guard + null guard on update

**Files:**
- Modify: `apps/api/src/product/product.service.ts`

### The bug
`buildProductsQuery` currently falls into a `category.slug = :categorySlug` branch when `categoryId` is not a UUID (e.g. a slug string from URL). This silently returns zero results. Fix: skip category filter entirely if not UUID.

`update()` calls `repository.update()` then `findOne()` which returns `null` but is typed as `Promise<Product>`. No guard exists. Fix: throw `NotFoundException` if `findOne` returns null.

- [ ] **Step 1: Edit `buildProductsQuery` — skip non-UUID categoryId**

In `apps/api/src/product/product.service.ts`, replace lines 23-29:

```typescript
// OLD:
    if (categoryId) {
      if (this.isUuid(categoryId)) {
        query.where('product.categoryId = :categoryId', { categoryId });
      } else {
        query.where('category.slug = :categorySlug', { categorySlug: categoryId });
      }
    }

// NEW:
    if (categoryId && this.isUuid(categoryId)) {
      query.where('product.categoryId = :categoryId', { categoryId });
    }
```

- [ ] **Step 2: Edit `update()` — add null guard**

In `apps/api/src/product/product.service.ts`, after `await this.productRepository.update(id, updateData);`:

```typescript
  async update(id: string, input: any): Promise<Product> {
    // ... existing updateData building ...
    await this.productRepository.update(id, updateData);
    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }
```

Also add `NotFoundException` to the imports at top of file:
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /home/kyuna/Desktop/mongol-beauty
yarn type-check 2>&1 | grep "product.service"
```

Expected: no errors for `product.service.ts`

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/product/product.service.ts
git commit -m "fix(product): skip non-UUID categoryId filter; null guard on update"
```

---

## Task 2: ProductResolver — gate `stock` field for non-admin

**Files:**
- Modify: `apps/api/src/product/product.resolver.ts`

### The requirement
`stock` is currently a plain column on the entity and resolves publicly. Admin should see real stock value; public sees `null`. We do this with a `@ResolveField` that overrides the entity field for the resolver graph.

- [ ] **Step 1: Add `@ResolveField` for stock in `product.resolver.ts`**

Add the following method to the `ProductResolver` class, after the `discountedPrice` resolver (around line 147):

```typescript
  @ResolveField(() => Int, { nullable: true })
  async stock(@Root() product: Product, @Context() context?: GraphqlContext): Promise<number | null> {
    const user = await this.requestUser(context);
    if (user?.isAdmin) {
      return product.stock;
    }
    return null;
  }
```

`Int` and `Root` are already imported at the top of the file.

- [ ] **Step 2: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "product.resolver"
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/product/product.resolver.ts
git commit -m "fix(product): gate stock field to admin-only via ResolveField"
```

---

## Task 3: AdminProductFormPage — add refetchQueries on create/update

**Files:**
- Modify: `apps/web/src/features/admin/pages/AdminProductFormPage.tsx`

### The bug
After create/update the page navigates to `/admin/products`, but Apollo still has the old list in cache. The `AdminProductsPage` loads `GET_ADMIN_PRODUCTS` from cache without refetching.

Fix: pass `refetchQueries` to both mutation calls.

- [ ] **Step 1: Add `GET_ADMIN_PRODUCTS` import**

In `apps/web/src/features/admin/pages/AdminProductFormPage.tsx`, add to existing imports:

```typescript
import { GET_ADMIN_PRODUCTS } from '@/graphql/queries';
```

- [ ] **Step 2: Add `refetchQueries` to mutation calls**

Replace lines 108-112:
```typescript
// OLD:
      if (isEdit) {
        await updateProduct({ variables: { input } });
      } else {
        await createProduct({ variables: { input } });
      }

// NEW:
      if (isEdit) {
        await updateProduct({ variables: { input }, refetchQueries: [{ query: GET_ADMIN_PRODUCTS }] });
      } else {
        await createProduct({ variables: { input }, refetchQueries: [{ query: GET_ADMIN_PRODUCTS }] });
      }
```

- [ ] **Step 3: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "AdminProductFormPage"
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/admin/pages/AdminProductFormPage.tsx
git commit -m "fix(admin): refetchQueries on product create/update so list refreshes"
```

---

## Task 4: ProductsPage — add `returnPartialData: false`

**Files:**
- Modify: `apps/web/src/features/catalog/pages/ProductsPage.tsx`

### The fix
Apollo can silently drop products when cache entries are partial (missing relations). `returnPartialData: false` makes Apollo treat partial cache entries as misses and fetch fresh data.

- [ ] **Step 1: Add `returnPartialData: false` to query options**

In `apps/web/src/features/catalog/pages/ProductsPage.tsx`, the `useQuery(GET_PRODUCTS_PAGED, {...})` call is at lines 55-61. Add `returnPartialData: false`:

```typescript
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
    networkStatus,
  } = useQuery(GET_PRODUCTS_PAGED, {
    variables: { categoryId: safeCategoryId, limit: PAGE_SIZE, offset: 0, search: searchQuery || undefined },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
    returnPartialData: false,
  });
```

- [ ] **Step 2: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "ProductsPage"
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/features/catalog/pages/ProductsPage.tsx
git commit -m "fix(catalog): returnPartialData false prevents Apollo silently dropping products"
```

---

## Task 5: DB Migrations — delivery settings + delivery fee + payment method

**Files:**
- Create: `apps/api/src/migrations/1746000000000-AddDeliverySettingsToSiteSettings.ts`
- Create: `apps/api/src/migrations/1746000001000-AddDeliveryFeeToOrders.ts`
- Create: `apps/api/src/migrations/1746000002000-AddPaymentMethodToOrders.ts`

- [ ] **Step 1: Create migration — AddDeliverySettingsToSiteSettings**

```typescript
// apps/api/src/migrations/1746000000000-AddDeliverySettingsToSiteSettings.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliverySettingsToSiteSettings1746000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "deliveryFee" integer NOT NULL DEFAULT 5000`,
    );
    await queryRunner.query(
      `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "freeDeliveryThreshold" integer NOT NULL DEFAULT 200000`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "freeDeliveryThreshold"`);
    await queryRunner.query(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "deliveryFee"`);
  }
}
```

- [ ] **Step 2: Create migration — AddDeliveryFeeToOrders**

```typescript
// apps/api/src/migrations/1746000001000-AddDeliveryFeeToOrders.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryFeeToOrders1746000001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "deliveryFee" integer NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "deliveryFee"`);
  }
}
```

- [ ] **Step 3: Create migration — AddPaymentMethodToOrders**

```typescript
// apps/api/src/migrations/1746000002000-AddPaymentMethodToOrders.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodToOrders1746000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
         CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CASH');
       EXCEPTION WHEN duplicate_object THEN null;
       END $$`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "paymentMethod" payment_method NOT NULL DEFAULT 'BANK_TRANSFER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "paymentMethod"`);
    await queryRunner.query(`DROP TYPE IF EXISTS payment_method`);
  }
}
```

- [ ] **Step 4: Run migrations**

Make sure Docker DB is running first:
```bash
yarn docker:up
```

Then run migrations:
```bash
yarn db:migrate
```

Expected: 3 new migrations executed, no errors.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/migrations/
git commit -m "feat(migrations): add delivery settings, delivery fee, payment method columns"
```

---

## Task 6: SiteSettings entity + DTO — add delivery fee fields

**Files:**
- Modify: `apps/api/src/content/site-settings.entity.ts`
- Modify: `apps/api/src/content/dto/update-site-settings.input.ts`

- [ ] **Step 1: Add columns to SiteSettings entity**

In `apps/api/src/content/site-settings.entity.ts`, add `Int` to the GraphQL imports and add two fields before `updatedAt`:

```typescript
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Entity('site_settings')
export class SiteSettings {
  @Field()
  @PrimaryColumn({ default: 'default' })
  id: string;

  @Field()
  @Column({ default: 'ХХБ' })
  bankName: string;

  @Field()
  @Column({ default: '1234567890' })
  bankAccount: string;

  @Field()
  @Column({ default: 'Mongol Beauty LLC' })
  bankOwner: string;

  @Field()
  @Column({ default: '9911-2233' })
  phone: string;

  @Field()
  @Column({ default: 'info@incellderm.mn' })
  email: string;

  @Field()
  @Column({ default: 'Улаанбаатар хот, Монгол улс' })
  address: string;

  @Field(() => Int)
  @Column({ type: 'int', default: 5000 })
  deliveryFee: number;

  @Field(() => Int)
  @Column({ type: 'int', default: 200000 })
  freeDeliveryThreshold: number;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Add fields to UpdateSiteSettingsInput DTO**

In `apps/api/src/content/dto/update-site-settings.input.ts`, add `IsInt, IsNumber` to class-validator imports and add two fields:

```typescript
import { Field, InputType, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

@InputType()
export class UpdateSiteSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bankOwner?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  deliveryFee?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  freeDeliveryThreshold?: number;
}
```

- [ ] **Step 3: Verify no type errors**

```bash
yarn type-check 2>&1 | grep -E "site-settings"
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/content/site-settings.entity.ts apps/api/src/content/dto/update-site-settings.input.ts
git commit -m "feat(site-settings): add deliveryFee and freeDeliveryThreshold fields"
```

---

## Task 7: Order entity + DTO — add deliveryFee, PaymentMethod enum, paymentMethod

**Files:**
- Modify: `apps/api/src/order/order.entity.ts`
- Modify: `apps/api/src/order/dto/create-order.input.ts`

- [ ] **Step 1: Add PaymentMethod enum and columns to Order entity**

In `apps/api/src/order/order.entity.ts`:

Add the enum before the class:
```typescript
export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
```

Add two `@Field` / `@Column` declarations to the `Order` class after `notes`:

```typescript
  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  deliveryFee: number;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;
```

Also add `Int` to the `@nestjs/graphql` import:
```typescript
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
```

Full resulting file:

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { User } from '../user/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  // Keep persisted value as CONFIRMED for DB compatibility.
  PAID_CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderStatus, { name: 'OrderStatus' });

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });

@ObjectType()
@Entity('orders')
@Index('IDX_orders_userId_createdAt', ['userId', 'createdAt'])
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Field()
  @Column('int')
  totalPrice: number;

  @Field(() => OrderStatus)
  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.WAITING_PAYMENT,
  })
  status: OrderStatus;

  @Field({ nullable: true })
  @Column({ nullable: true })
  paymentReceiptUrl: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true, unique: true })
  idempotencyKey?: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.orders, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @Field(() => [String])
  @Column({ type: 'simple-array', default: '' })
  notes: string[];

  @Field(() => Int)
  @Column({ type: 'int', default: 0 })
  deliveryFee: number;

  @Field(() => PaymentMethod)
  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.BANK_TRANSFER,
  })
  paymentMethod: PaymentMethod;

  @Field({ nullable: true })
  @Column({ nullable: true })
  supplierName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  koreaTrackingId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  estimatedDays?: string;

  @Field()
  @Index()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Field()
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
```

- [ ] **Step 2: Add paymentMethod to CreateOrderInput DTO**

In `apps/api/src/order/dto/create-order.input.ts`, import `PaymentMethod` and add the optional field:

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../order.entity';

@InputType()
export class CreateOrderItemInput {
  @Field()
  @IsUUID()
  productId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateOrderInput {
  @Field(() => [CreateOrderItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemInput)
  items: CreateOrderItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\d{8}$/, { message: 'phone must be 8 digits' })
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @Field(() => [String], { nullable: true, defaultValue: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];

  @Field(() => PaymentMethod, { nullable: true, defaultValue: PaymentMethod.BANK_TRANSFER })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;
}
```

- [ ] **Step 3: Verify no type errors**

```bash
yarn type-check 2>&1 | grep -E "order.entity|create-order"
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/order/order.entity.ts apps/api/src/order/dto/create-order.input.ts
git commit -m "feat(order): add deliveryFee column, PaymentMethod enum and paymentMethod column"
```

---

## Task 8: OrderService.create — delivery fee + paymentMethod + cash note

**Files:**
- Modify: `apps/api/src/order/order.service.ts`

The `create` method must:
1. Fetch `SiteSettings` inside the transaction
2. Compute `deliveryFee` based on `subtotal >= freeDeliveryThreshold`
3. Add `deliveryFee` to `totalPrice`
4. Store `paymentMethod` from input (default `BANK_TRANSFER`)
5. For cash orders, append `"Бэлэн мөнгөөр төлнө"` to notes

- [ ] **Step 1: Add SiteSettings import to order.service.ts**

Add to imports at the top of `apps/api/src/order/order.service.ts`:

```typescript
import { SiteSettings } from '../content/site-settings.entity';
import { PaymentMethod } from './order.entity';
```

- [ ] **Step 2: Replace the `create` method body**

Replace the `order = orderRepo.create({...})` block and everything after it inside the transaction. The full updated `create` method:

```typescript
  async create(input: CreateOrderInput, userId?: string, idempotencyKey?: string): Promise<Order> {
    if (idempotencyKey) {
      const existing = await this.orderRepository.findOne({
        where: { idempotencyKey },
        relations: ['items', 'items.product', 'user'],
      });
      if (existing) {
        return existing;
      }
    }

    return this.dataSource.transaction(async (manager) => {
      const productRepo = manager.getRepository(Product);
      const orderRepo = manager.getRepository(Order);
      const orderItemRepo = manager.getRepository(OrderItem);
      const settingsRepo = manager.getRepository(SiteSettings);

      let subtotal = 0;
      const items: OrderItem[] = [];

      for (const itemInput of input.items) {
        const product = await productRepo.findOne({
          where: { id: itemInput.productId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!product) {
          throw new NotFoundException(`Product ${itemInput.productId} not found`);
        }

        if (product.stock < itemInput.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        await productRepo.decrement({ id: product.id }, 'stock', itemInput.quantity);

        subtotal += product.price * itemInput.quantity;

        const orderItem = orderItemRepo.create({
          productId: itemInput.productId,
          quantity: itemInput.quantity,
          price: product.price,
        });
        items.push(orderItem);
      }

      const settings = await settingsRepo.findOne({ where: { id: 'default' } });
      const feeThreshold = settings?.freeDeliveryThreshold ?? 200000;
      const feeAmount = settings?.deliveryFee ?? 5000;
      const deliveryFee = subtotal >= feeThreshold ? 0 : feeAmount;
      const totalPrice = subtotal + deliveryFee;

      const paymentMethod = input.paymentMethod ?? PaymentMethod.BANK_TRANSFER;
      const notes = [...(input.notes ?? [])];
      if (paymentMethod === PaymentMethod.CASH) {
        notes.push('Бэлэн мөнгөөр төлнө');
      }

      const order = orderRepo.create({
        userId,
        idempotencyKey,
        status: OrderStatus.WAITING_PAYMENT,
        totalPrice,
        deliveryFee,
        paymentMethod,
        items,
        deliveryAddress: input.deliveryAddress,
        notes,
      });

      const saved = await orderRepo.save(order);
      return orderRepo.findOneOrFail({
        where: { id: saved.id },
        relations: ['items', 'items.product', 'user'],
      });
    });
  }
```

- [ ] **Step 3: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "order.service"
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/order/order.service.ts
git commit -m "feat(order): compute delivery fee from SiteSettings, store paymentMethod, append cash note"
```

---

## Task 9: Run GraphQL codegen

After all backend changes, regenerate frontend types.

- [ ] **Step 1: Run codegen**

```bash
yarn graphql:codegen
```

Expected: generates updated types without errors. If schema drift errors appear, the entity/resolver changes from Tasks 1-8 must compile first — run `yarn type-check` to confirm API compiles.

- [ ] **Step 2: Commit generated files**

```bash
git add apps/web/src/graphql/
git commit -m "chore: regenerate GraphQL types after Bucket A schema changes"
```

---

## Task 10: Frontend GraphQL queries — add new fields

**Files:**
- Modify: `apps/web/src/graphql/queries.ts`
- Modify: `apps/web/src/graphql/orders.ts`

- [ ] **Step 1: Update GET_SITE_SETTINGS**

In `apps/web/src/graphql/queries.ts`, update `GET_SITE_SETTINGS` to add the two new fields:

```typescript
export const GET_SITE_SETTINGS = gql`
  query GetSiteSettings {
    siteSettings {
      id
      bankName
      bankAccount
      bankOwner
      phone
      email
      address
      deliveryFee
      freeDeliveryThreshold
      updatedAt
    }
  }
`;
```

- [ ] **Step 2: Update GET_ADMIN_ORDERS**

In `apps/web/src/graphql/queries.ts`, add `paymentMethod` and `deliveryFee` to the items block inside `GET_ADMIN_ORDERS`:

```typescript
export const GET_ADMIN_ORDERS = gql`
  query GetAdminOrders($limit: Int, $offset: Int, $status: OrderStatus) {
    adminOrders(limit: $limit, offset: $offset, status: $status) {
      total
      limit
      offset
      items {
        id
        totalPrice
        deliveryFee
        paymentMethod
        status
        paymentReceiptUrl
        deliveryAddress
        notes
        supplierName
        koreaTrackingId
        estimatedDays
        createdAt
        updatedAt
        items {
          id
          quantity
          price
          product {
            id
            name
          }
        }
        user {
          id
          name
          phone
        }
      }
    }
  }
`;
```

- [ ] **Step 3: Update CREATE_ORDER_SIMPLE**

In `apps/web/src/graphql/orders.ts`, add `paymentMethod` to the returned fields:

```typescript
export const CREATE_ORDER_SIMPLE = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalPrice
      deliveryFee
      paymentMethod
      status
    }
  }
`;
```

- [ ] **Step 4: Verify no type errors**

```bash
yarn type-check 2>&1 | grep -E "queries|orders\.ts"
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/graphql/queries.ts apps/web/src/graphql/orders.ts
git commit -m "feat(graphql): add deliveryFee, freeDeliveryThreshold, paymentMethod to queries"
```

---

## Task 11: CheckoutPage — delivery fee display + payment method selector

**Files:**
- Modify: `apps/web/src/features/checkout/pages/CheckoutPage.tsx`

This is the biggest frontend change. The CheckoutPage needs:
1. `paymentMethod` state (`'BANK_TRANSFER' | 'CASH'`)
2. Delivery fee computed from `siteSettings`
3. Delivery fee line in order summary (green badge if free, line item if charged)
4. Payment method selector UI (two card buttons)
5. Bank info + receipt upload shown only for BANK_TRANSFER
6. Cash info banner for CASH
7. Submit button `disabled` condition changes: cash only requires `isPhoneValid`
8. Order mutation payload includes `paymentMethod`; cash skips receipt upload

- [ ] **Step 1: Add paymentMethod state and delivery fee computation**

Add the following state after the existing `const [isSubmitting, setIsSubmitting] = useState(false);` declaration (around line 26):

```typescript
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH'>('BANK_TRANSFER');
```

Replace the `baseTotal`/`totalPrice` computation block (lines 170-176) with:

```typescript
  const baseTotal = (cart as CheckoutCartItem[]).reduce((sum: number, item: CheckoutCartItem) => {
    return sum + (item.price || 0) * item.quantity;
  }, 0);
  const vipDiscount = isVip ? 0.2 : 0;
  const voucherDiscountRate = voucherDiscount ? voucherDiscount / 100 : 0;
  const effectiveDiscount = Math.max(vipDiscount, voucherDiscountRate);
  const subtotal = Math.round(baseTotal * (1 - effectiveDiscount));
  const feeThreshold = settings?.freeDeliveryThreshold ?? 200000;
  const deliveryFeeAmount = subtotal >= feeThreshold ? 0 : (settings?.deliveryFee ?? 5000);
  const totalPrice = subtotal + deliveryFeeAmount;
```

- [ ] **Step 2: Update handleCreateOrder — conditional receipt check, paymentMethod in payload**

Replace the existing `handleCreateOrder` function (lines 90-168) with:

```typescript
  const handleCreateOrder = async () => {
    const block = getCheckoutCreateOrderBlock(hasCartItems, phone);
    if (block === 'empty_cart') {
      setToastMessage('Сагс хоосон байна. Эхлээд бүтээгдэхүүн нэмнэ үү.');
      setShowToast(true);
      return;
    }
    if (block === 'invalid_phone') {
      setToastMessage('Утасны дугаар 8 оронтой байх шаардлагатай.');
      setShowToast(true);
      return;
    }
    if (paymentMethod === 'BANK_TRANSFER') {
      if (!receiptFile) {
        setToastMessage('Гүйлгээний баримтын зураг заавал оруулна уу.');
        setShowToast(true);
        return;
      }
      if (!allowedReceiptMime.has(receiptFile.type)) {
        setToastMessage('Файлын төрөл буруу байна. JPG, PNG, WEBP, GIF, HEIC зураг оруулна уу.');
        setShowToast(true);
        return;
      }
      if (receiptFile.size > maxReceiptBytes) {
        setToastMessage('Баримтын файл хэт том байна. 5MB-аас бага зураг сонгоно уу.');
        setShowToast(true);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const { data } = await createOrder({
        variables: {
          input: {
            items: (cart as CheckoutCartItem[]).map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            phone: phone || undefined,
            name: name || undefined,
            deliveryAddress: deliveryAddress || undefined,
            notes: notes.length > 0 ? notes : undefined,
            paymentMethod,
          },
        },
      });

      const createdOrderId = data?.createOrder?.id as string | undefined;
      if (!createdOrderId) {
        throw new Error('Захиалга үүсгэж чадсангүй. Дахин оролдоно уу.');
      }

      if (paymentMethod === 'BANK_TRANSFER' && receiptFile) {
        try {
          await uploadReceipt({
            variables: {
              file: receiptFile,
              orderId: createdOrderId,
            },
          });
        } catch (uploadError) {
          setToastMessage(
            getErrorMessage(
              uploadError,
              `Захиалга үүслээ (#${createdOrderId.slice(0, 8)}), гэхдээ баримт илгээхэд алдаа гарлаа.`,
            ),
          );
          setShowToast(true);
          return;
        }
        setToastMessage('Захиалга амжилттай үүсэж, төлбөрийн баримт илгээгдлээ. Админ шалгасны дараа төлөв "Төлбөр баталгаажсан" болно.');
      } else {
        setToastMessage('Захиалга амжилттай үүслээ. Хүргэлтийн үед бэлэн мөнгөөр төлнө.');
      }

      await clear();
      setShowToast(true);
      setTimeout(() => {
        navigate(`/orders/${createdOrderId}`);
      }, 1500);
    } catch (error) {
      setToastMessage(getErrorMessage(error, 'Алдаа гарлаа. Дахин оролдоно уу.'));
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };
```

- [ ] **Step 3: Update order summary to show delivery fee**

Replace the order summary section (the `{/* Order Summary */}` block, approximately lines 282-308) with:

```tsx
        {/* Order Summary */}
        <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>📋</span>
              Захиалгын дүн
            </h3>
            <div className="space-y-3">
              {(cart as CheckoutCartItem[]).map((item) => (
                <div key={item.productId} className="flex justify-between text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="text-gray-700">Бүтээгдэхүүн x{item.quantity}</span>
                  <span className="font-semibold text-primary-600">{(item.price * item.quantity).toLocaleString()}₮</span>
                </div>
              ))}
              {effectiveDiscount > 0 && (
                <div className="flex justify-between text-sm bg-green-50 px-4 py-2 rounded-xl text-green-700">
                  <span>Хөнгөлөлт ({Math.round(effectiveDiscount * 100)}%):</span>
                  <span className="font-semibold">-{(baseTotal - subtotal).toLocaleString()}₮</span>
                </div>
              )}
              {deliveryFeeAmount === 0 ? (
                <div className="flex justify-between text-sm bg-green-50 px-4 py-2 rounded-xl text-green-700">
                  <span>Хүргэлт:</span>
                  <span className="font-semibold">Үнэгүй хүргэлт 🎉</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="text-gray-700">Хүргэлт:</span>
                  <span className="font-semibold text-gray-800">{deliveryFeeAmount.toLocaleString()}₮</span>
                </div>
              )}
              <div className="border-t-2 border-beige-300 pt-4 mt-4 flex justify-between items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl">
                <span className="font-bold text-lg text-gray-800">Нийт:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {totalPrice.toLocaleString()}₮
                </span>
              </div>
            </div>
        </div>
```

- [ ] **Step 4: Replace bank info block with payment selector + conditional sections**

Replace the entire `{/* Bank Info */}` block (approximately lines 310-350) with:

```tsx
        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>💳</span>
            Төлбөрийн арга
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">💳</span>
              <span className="text-sm font-medium">Банкны шилжүүлэг</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">💵</span>
              <span className="text-sm font-medium">Бэлэн мөнгө</span>
            </button>
          </div>
        </div>

        {/* Bank Transfer Details (conditional) */}
        {paymentMethod === 'BANK_TRANSFER' && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-100 shadow-sm">
              <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
                <span>💳</span>
                Төлбөрийн мэдээлэл
              </h3>
              <p className="text-sm text-gray-700 mb-4 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl">
                Доорх данс руу төлбөрөө шилжүүлээд баримтын зургаа оруулна уу. Админ шалгаад төлбөрийн төлөвийг баталгаажуулна. 💰
              </p>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="font-medium text-gray-600">Банк:</span>
                  <span className="font-bold text-gray-800">{settings?.bankName ?? 'ХХБ'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-blue-100">
                  <span className="font-medium text-gray-600">Данс:</span>
                  <span className="font-bold text-gray-800 font-mono">{settings?.bankAccount ?? '1234567890'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600">Эзэмшлийн нэр:</span>
                  <span className="font-bold text-gray-800">{settings?.bankOwner ?? 'Mongol Beauty LLC'}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl border-2 border-dashed border-blue-300 bg-white p-4">
                <p className="mb-2 text-sm font-semibold text-gray-800">Гүйлгээний баримтын зураг оруулах (заавал)</p>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                  <Upload className="h-4 w-4" />
                  Зураг сонгох
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-sm text-gray-700">
                  {receiptFile ? `Сонгосон файл: ${receiptFile.name}` : 'Одоогоор файл сонгоогүй байна'}
                </p>
                <p className="mt-1 text-xs text-gray-500">Дэмжигдэх формат: JPG, PNG, WEBP, GIF, HEIC (max 5MB)</p>
              </div>
          </div>
        )}

        {/* Cash Info Banner (conditional) */}
        {paymentMethod === 'CASH' && (
          <div className="bg-amber-50 rounded-2xl p-6 mb-4 border-2 border-amber-200 shadow-sm">
            <h3 className="font-bold mb-2 text-amber-800 flex items-center gap-2">
              <span>💵</span>
              Бэлэн мөнгөөр төлөх
            </h3>
            <p className="text-sm text-amber-700">
              Хүргэлтийн үед бэлэн мөнгөөр төлнө. Баримт шаардлагагүй.
            </p>
          </div>
        )}
```

- [ ] **Step 5: Update submit button disabled condition**

Replace the `disabled` prop on the submit button (line 364):

```tsx
// OLD:
            disabled={!hasCartItems || !isPhoneValid || !receiptFile || isSubmitting}

// NEW:
            disabled={!hasCartItems || !isPhoneValid || (paymentMethod === 'BANK_TRANSFER' && !receiptFile) || isSubmitting}
```

- [ ] **Step 6: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "CheckoutPage"
```

Expected: no errors

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/features/checkout/pages/CheckoutPage.tsx
git commit -m "feat(checkout): delivery fee display, payment method selector, conditional receipt upload"
```

---

## Task 12: AdminSiteSettingsPage — add delivery fee inputs

**Files:**
- Modify: `apps/web/src/features/admin/pages/AdminSiteSettingsPage.tsx`

- [ ] **Step 1: Add deliveryFee and freeDeliveryThreshold to form state**

In `apps/web/src/features/admin/pages/AdminSiteSettingsPage.tsx`, update the `form` state type and initialization:

Replace the `useState` call (lines 13-20):
```typescript
  const [form, setForm] = useState({
    bankName: '',
    bankAccount: '',
    bankOwner: '',
    phone: '',
    email: '',
    address: '',
    deliveryFee: 5000,
    freeDeliveryThreshold: 200000,
  });
```

Update the `useEffect` that populates from data (lines 23-34):
```typescript
  useEffect(() => {
    if (data?.siteSettings) {
      const s = data.siteSettings;
      setForm({
        bankName: s.bankName ?? '',
        bankAccount: s.bankAccount ?? '',
        bankOwner: s.bankOwner ?? '',
        phone: s.phone ?? '',
        email: s.email ?? '',
        address: s.address ?? '',
        deliveryFee: s.deliveryFee ?? 5000,
        freeDeliveryThreshold: s.freeDeliveryThreshold ?? 200000,
      });
    }
  }, [data]);
```

- [ ] **Step 2: Add delivery fee inputs to the form UI**

Add a new section after the closing `</div>` of the "Холбоо барих" section (before the final `</div>` that closes the card, approximately after line 129):

```tsx
        <div className="pt-2 border-t border-gray-100 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Хүргэлтийн тохиргоо</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Хүргэлтийн хөлс (₮)</label>
            <input
              type="number"
              min={0}
              value={form.deliveryFee}
              onChange={(e) => setForm((f) => ({ ...f, deliveryFee: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Үнэгүй хүргэлтийн босго (₮)</label>
            <input
              type="number"
              min={0}
              value={form.freeDeliveryThreshold}
              onChange={(e) => setForm((f) => ({ ...f, freeDeliveryThreshold: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Энэ дүнгээс дээш захиалгад үнэгүй хүргэлт нэмэгдэнэ</p>
          </div>
        </div>
```

- [ ] **Step 3: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "AdminSiteSettingsPage"
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features/admin/pages/AdminSiteSettingsPage.tsx
git commit -m "feat(admin): add delivery fee and threshold inputs to site settings page"
```

---

## Task 13: AdminOrdersPage — payment method badge + cash background

**Files:**
- Modify: `apps/web/src/features/admin/pages/AdminOrdersPage.tsx`

- [ ] **Step 1: Update AdminOrder interface**

Check `apps/web/src/interfaces/admin.ts` for the `AdminOrder` type and add `paymentMethod` and `deliveryFee` fields if not yet present. Read the file first:

```bash
cat apps/web/src/interfaces/admin.ts
```

Add to the `AdminOrder` interface:
```typescript
  paymentMethod?: 'BANK_TRANSFER' | 'CASH';
  deliveryFee?: number;
```

- [ ] **Step 2: Add payment method badge to each order row**

In `apps/web/src/features/admin/pages/AdminOrdersPage.tsx`, find the order card render (the `order.items.map` or order card block). Add a payment method badge near the order ID/status badges.

After reading the existing render, add a `PAYMENT_CONFIG` constant near `STATUS_CONFIG`:

```typescript
const PAYMENT_CONFIG = {
  BANK_TRANSFER: { label: '💳 Шилжүүлэг', badgeCls: 'bg-blue-50 text-blue-700' },
  CASH:          { label: '💵 Бэлэн',     badgeCls: 'bg-amber-50 text-amber-700' },
} as const;
```

- [ ] **Step 3: Add amber background for cash orders and payment badge in card**

In the order card JSX, find the outer card container div. Add conditional amber background:

```tsx
// Find the card container — something like:
<div key={order.id} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">

// Change to:
<div
  key={order.id}
  className={`border rounded-xl p-5 space-y-3 ${
    order.paymentMethod === 'CASH'
      ? 'bg-amber-50 border-amber-200'
      : 'bg-white border-gray-200'
  }`}
>
```

Then add the payment badge next to the status badge (in the header row of the card):

```tsx
{order.paymentMethod && PAYMENT_CONFIG[order.paymentMethod as keyof typeof PAYMENT_CONFIG] && (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
    PAYMENT_CONFIG[order.paymentMethod as keyof typeof PAYMENT_CONFIG].badgeCls
  }`}>
    {PAYMENT_CONFIG[order.paymentMethod as keyof typeof PAYMENT_CONFIG].label}
  </span>
)}
```

> **Note:** Read `AdminOrdersPage.tsx` lines 80-200 before editing to find exact card container class and header row structure. Adapt the JSX edits to match the exact current structure.

- [ ] **Step 4: Verify no type errors**

```bash
yarn type-check 2>&1 | grep "AdminOrdersPage"
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/features/admin/pages/AdminOrdersPage.tsx apps/web/src/interfaces/admin.ts
git commit -m "feat(admin): payment method badge and amber background for cash orders"
```

---

## Task 14: Final lint + type-check pass

- [ ] **Step 1: Full type check**

```bash
yarn type-check
```

Expected: 0 errors

- [ ] **Step 2: Lint**

```bash
yarn lint
```

Expected: 0 warnings (max-warnings=0 enforced)

- [ ] **Step 3: Fix any remaining lint issues**

```bash
yarn lint:fix
```

Then re-run `yarn lint` to confirm clean.

- [ ] **Step 4: Final commit if any lint fixes applied**

```bash
git add -p
git commit -m "fix(lint): address lint warnings after Bucket A implementation"
```

---

## Testing Checklist

### CRUD
- [ ] Create product → appears in admin list immediately (no manual refresh)
- [ ] Update product name/price → changes reflected in list
- [ ] Delete product → removed from list, no 404 on reload
- [ ] Public product listing → `stock` field returns null (check Network tab in browser)

### Product visibility
- [ ] All products visible at `/products` with no categoryId
- [ ] Navigating to a valid category shows only that category's products
- [ ] Navigating to `/products/some-slug` shows all products (no empty page)

### Delivery fee
- [ ] Cart subtotal ≥ 200,000₮ → "Үнэгүй хүргэлт 🎉" shown, total = subtotal
- [ ] Cart subtotal < 200,000₮ → fee line shown, total = subtotal + fee
- [ ] Admin changes fee threshold → checkout reflects new value on next load
- [ ] Created order in DB has correct `deliveryFee` column value

### Payment method
- [ ] Bank transfer (default): receipt upload shown and required
- [ ] Cash: receipt section hidden, amber banner shown
- [ ] Cash order submits with phone only (no file)
- [ ] Cash order has `paymentMethod: CASH` in DB, notes include "Бэлэн мөнгөөр төлнө"
- [ ] Admin orders list: cash orders show amber background and 💵 badge
- [ ] Admin orders list: bank transfer orders show 💳 badge
