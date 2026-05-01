# Bucket A — Core Commerce Fixes

**Date:** 2026-04-30  
**Status:** Approved  
**Scope:** 4 features — Admin CRUD audit, Product visibility fix, Delivery fee rule, Payment method (cash)

---

## 1. Admin Product CRUD Audit & Fix

### Problem
Admin product create/update/delete operations are broken in ways unknown — full audit required.

### Root Causes (identified)

| Operation | Likely Bug | Fix |
|-----------|-----------|-----|
| Create | Resolver may return raw save result without relations; Apollo caches broken object | Ensure `ProductService.create` always returns `findOne(saved.id)` with relations; already coded — verify resolver passes it through |
| Update | `repository.update()` returns `UpdateResult`, not entity; `findOne` after may return null without guard | Add `NotFoundException` guard if `findOne` returns null after update |
| Delete | Frontend doesn't refetch list after delete; Apollo cache stale | Add `refetchQueries: ['GetAdminProducts']` (or equivalent) to delete mutation call in `AdminProductsPage` |
| All mutations | Apollo cache not invalidated after CUD operations | Add `refetchQueries` to create/update/delete mutation hooks in all admin product pages |

### Stock visibility (req #13 part 2)
`stock` is currently exposed as a public GraphQL field. Fix: resolve `stock` to `null` for non-admin requests in `ProductResolver` using the existing `GqlAdminGuard` / request context. The field stays in schema as nullable — admin sees real value, public sees `null`.

### Files affected
- `apps/api/src/product/product.service.ts` — null-guard on update
- `apps/api/src/product/product.resolver.ts` — stock field resolver gated by admin context
- `apps/web/src/features/admin/pages/AdminProductsPage.tsx` — refetchQueries on delete
- `apps/web/src/features/admin/pages/AdminProductFormPage.tsx` — refetchQueries on create/update

---

## 2. Product Visibility Fix

### Problem
Products exist in the database but do not appear on the public listing page.

### Root Causes (in priority order)

**Suspect 1 — Invalid categoryId leaking into query**  
`ProductsPage` reads `categoryId` from URL params. If the value is a slug or garbage string, the backend falls into `category.slug = :categorySlug` branch and returns zero results silently. The frontend `isUuidLike()` guard exists but the backend has no equivalent defence.

Fix: In `ProductService.buildProductsQuery`, if `categoryId` is provided but fails UUID format check, skip the category filter entirely (treat as "all products").

**Suspect 2 — `simple-array` empty string serialisation**  
TypeORM `simple-array` with `default: ''` can deserialise as `['']` (one empty-string element) in some ORM versions, causing Apollo to write malformed product objects into cache, breaking list rendering.

Fix: Normalise on read — in `ProductResolver`, strip empty-string elements from `skinType`, `features`, `images` arrays before returning.

**Suspect 3 — Apollo partial cache miss**  
Broken cache entries (missing `category` relation) can cause Apollo to silently drop products from rendered list.

Fix: Set `errorPolicy: 'all'` (already set) and add `returnPartialData: false` to the `GET_PRODUCTS_PAGED` query options.

### Files affected
- `apps/api/src/product/product.service.ts` — UUID guard in `buildProductsQuery`
- `apps/api/src/product/product.resolver.ts` — strip empty array elements
- `apps/web/src/features/catalog/pages/ProductsPage.tsx` — Apollo query options

---

## 3. Delivery Fee Rule

### Business rule
- Orders with subtotal ≥ 200,000₮ → free delivery
- Orders below threshold → charge flat `deliveryFee`
- Both values are admin-configurable

### Schema changes

**Migration: `AddDeliverySettingsToSiteSettings`**
```sql
ALTER TABLE site_settings
  ADD COLUMN "deliveryFee" integer NOT NULL DEFAULT 5000,
  ADD COLUMN "freeDeliveryThreshold" integer NOT NULL DEFAULT 200000;
```

**Migration: `AddDeliveryFeeToOrders`**
```sql
ALTER TABLE orders
  ADD COLUMN "deliveryFee" integer NOT NULL DEFAULT 0;
```

The `Order.deliveryFee` column stores the fee at time of order creation (snapshot). This is critical — admin may change the fee later, but existing orders must reflect what the customer was charged.

### API changes
- `SiteSettings` entity: add `deliveryFee: Int`, `freeDeliveryThreshold: Int`
- `SiteSettings` GraphQL type: expose both fields
- `UpdateSiteSettingsInput`: add optional `deliveryFee`, `freeDeliveryThreshold`
- `Order` entity: add `deliveryFee: Int` (default 0)
- `Order` GraphQL type: expose `deliveryFee`
- `OrderService.create`: fetch `SiteSettings`, compute fee, attach to order before save. Client does NOT send `deliveryFee`.

### Frontend changes
- `CheckoutPage`: compute `deliveryFee` from `siteSettings` fields (already fetched)
  ```
  deliveryFee = subtotal >= freeDeliveryThreshold ? 0 : settings.deliveryFee
  totalPrice = subtotal - discount + deliveryFee
  ```
- Show delivery fee line in order summary:
  - If free: green badge "Үнэгүй хүргэлт 🎉" 
  - If charged: line item "Хүргэлт: {deliveryFee.toLocaleString()}₮"
- `AdminSiteSettingsPage`: add two number inputs for new fields

### Files affected
- `apps/api/src/content/site-settings.entity.ts`
- `apps/api/src/content/site-settings.service.ts`
- `apps/api/src/content/dto/update-site-settings.input.ts`
- `apps/api/src/order/order.entity.ts`
- `apps/api/src/order/order.service.ts`
- `apps/api/src/migrations/` — two new migration files
- `apps/web/src/features/checkout/pages/CheckoutPage.tsx`
- `apps/web/src/features/admin/pages/AdminSiteSettingsPage.tsx`
- `apps/web/src/graphql/queries.ts` — add new fields to `GET_SITE_SETTINGS`

---

## 4. Payment Method — Bank Transfer + Cash

### Business rule
- Bank transfer: existing flow, receipt upload required
- Cash: no receipt, order created immediately, admin confirms on delivery

### Schema change

**Migration: `AddPaymentMethodToOrders`**
```sql
CREATE TYPE payment_method AS ENUM ('BANK_TRANSFER', 'CASH');
ALTER TABLE orders
  ADD COLUMN "paymentMethod" payment_method NOT NULL DEFAULT 'BANK_TRANSFER';
```

### API changes
- Add `PaymentMethod` enum: `BANK_TRANSFER | CASH`
- `CreateOrderInput`: add optional `paymentMethod: PaymentMethod = BANK_TRANSFER`
- `Order` entity + GraphQL type: expose `paymentMethod`
- `OrderService.create`: accept `paymentMethod`, store on order
- Cash orders: auto-append `"Бэлэн мөнгөөр төлнө"` to `notes` array in service

### Frontend changes (`CheckoutPage`)

**Payment selector UI** — two card buttons rendered before bank info block:
```
[💳 Банкны шилжүүлэг]   [💵 Бэлэн мөнгө]
```

**Conditional rendering:**
- Bank transfer selected → show bank account info + receipt upload (required)
- Cash selected → hide bank info and receipt upload; show info banner "Хүргэлтийн үед бэлэн мөнгөөр төлнө"

**Submit button enabled when:**
- Bank transfer: `phone valid AND receiptFile != null`
- Cash: `phone valid` (no receipt required)

**Order payload:**
- Bank transfer: existing flow unchanged
- Cash: `paymentMethod: 'CASH'`, no receipt upload step

### Admin orders page
- Show payment method badge on each order row: `💳 Шилжүүлэг` or `💵 Бэлэн`
- Cash orders show distinct background (e.g. amber-50) so admin knows no receipt to verify

### Files affected
- `apps/api/src/order/order.entity.ts`
- `apps/api/src/order/order.service.ts`
- `apps/api/src/order/dto/create-order.input.ts`
- `apps/api/src/migrations/` — one new migration file
- `apps/web/src/features/checkout/pages/CheckoutPage.tsx`
- `apps/web/src/features/admin/pages/AdminOrdersPage.tsx`
- `apps/web/src/graphql/orders.ts` — add `paymentMethod` to order fragments

---

## Migration sequence

Run in this order — each is additive, no data loss:

1. `AddDeliverySettingsToSiteSettings`
2. `AddDeliveryFeeToOrders`
3. `AddPaymentMethodToOrders`

---

## Testing checklist

### CRUD
- [ ] Create product → appears in admin list immediately
- [ ] Update product name/price → changes reflected in list
- [ ] Delete product → removed from list, no 404 on reload
- [ ] Public product listing → `stock` field is null / not exposed

### Product visibility
- [ ] All products visible at `/products` with no categoryId
- [ ] Navigating to a valid category shows only that category's products
- [ ] Navigating to `/products/invalid-slug` shows all products (no empty page)

### Delivery fee
- [ ] Cart ≥ 200,000₮ → "Үнэгүй хүргэлт" shown, deliveryFee = 0
- [ ] Cart < 200,000₮ → fee line shown, total includes fee
- [ ] Admin changes threshold/fee → checkout reflects new value
- [ ] Created order stores delivery fee snapshot correctly

### Payment method
- [ ] Bank transfer: receipt required, order fails without it
- [ ] Cash: no receipt field shown, order submits with phone only
- [ ] Cash order has `paymentMethod: CASH` in DB
- [ ] Admin orders list shows payment method badge correctly
