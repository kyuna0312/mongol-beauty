# Phase 1 — Product & Catalog Design

**Date:** 2026-04-30  
**Project:** Mongol Beauty (Мөнгөн Косметикс)  
**Scope:** Product visibility, stock hiding, brand hierarchy, rich descriptions, catalog filters

---

## Summary

Phase 1 improves the product catalog for both customers and admins:
- Out-of-stock products are hidden from the storefront (server-side)
- Stock numbers are never shown to the public
- Categories support brand hierarchy (Brand → Subcategory)
- Admins can publish/unpublish products with an `isPublished` flag
- Product descriptions support rich HTML via TipTap editor
- Catalog supports Brand, Price range, and Skin type filters

---

## 1. Data Model

### Migration: Add `isPublished` to Product

One new migration required:

```typescript
// src/migrations/TIMESTAMP-AddIsPublishedToProduct.ts
ALTER TABLE product ADD COLUMN "isPublished" boolean NOT NULL DEFAULT true;
```

- Default `true` — all existing products remain visible after migration
- Admin can explicitly unpublish a product regardless of stock
- No other entity changes needed

### Category hierarchy

Already supported via existing `parent` (ManyToOne) and `children` (OneToMany) on Category entity. No migration needed.

- **Brand** = top-level Category (no parentId)
- **Subcategory** = Category with parentId pointing to a brand

---

## 2. API Changes

### 2a. Product query — new filter args

Extend `products` and `productsPaged` resolvers:

```graphql
products(
  categoryId: ID        # existing — matches brand or subcategory by UUID or slug
  search: String        # existing
  minPrice: Int         # new
  maxPrice: Int         # new
  skinType: [SkinType!] # new
  limit: Int
  offset: Int
): [Product!]!
```

All new args are optional. Filters applied in `buildProductsQuery` in `product.service.ts`.

### 2b. isPublished filtering

`buildProductsQuery` adds for all public queries:

```typescript
query.andWhere('product.isPublished = :isPublished', { isPublished: true });
```

Admin queries bypass this filter: `buildProductsQuery` checks `ctx.user?.isAdmin` and skips the `isPublished` condition when true. The existing `products` resolver is reused for admin — no separate resolver needed.

### 2c. Stock field — hidden from public

`Product.stock` resolver returns `null` for non-admin requests. Field stays in schema (no codegen break). Cart quantity validation moves to server-side check at order creation time.

Implementation: field-level guard in `product.resolver.ts`:

```typescript
@ResolveField(() => Float, { nullable: true })
stock(@Parent() product: Product, @Context() ctx: GqlContext): number | null {
  return ctx.user?.isAdmin ? product.stock : null;
}
```

### 2d. Mutations — add isPublished

```graphql
input CreateProductInput {
  # ... existing fields ...
  isPublished: Boolean! = true
}

input UpdateProductInput {
  # ... existing fields ...
  isPublished: Boolean
}
```

---

## 3. Frontend Changes

### 3a. Remove public stock display

Files to modify:

| File | Change |
|------|--------|
| `packages/ui/src/ProductCard.tsx` | Remove "Нөөц: X" text (line 121), remove "Сүүлийн X ширхэг" badge (lines 71–75), remove "Нөөц дууссан" badge (line 66–70) |
| `apps/web/src/features/catalog/pages/ProductDetailPage.tsx` | Remove stock count display (line 364), keep add-to-cart disabled logic via server error on stock=0 attempt |

Since out-of-stock products are hidden server-side, the "out of stock" badge is no longer needed on cards. Cart max-quantity enforcement stays (uses server response).

### 3b. Catalog filter sidebar

New component: `apps/web/src/features/catalog/components/FilterSidebar.tsx`

Filters:
- **Brand** — checkboxes from top-level categories (no parentId). Phase 1: single-select only — `categoryId` param takes one brand UUID. Multi-brand filter is Phase 2+.
- **Price range** — two number inputs: min/max. Debounced, passed as `minPrice`/`maxPrice`
- **Skin type** — checkboxes: DRY, OILY, COMBINATION, SENSITIVE, NORMAL. Passed as `skinType: [SkinType!]`

Desktop: left sidebar on `ProductsPage`.  
Mobile: slide-over drawer triggered by existing filter button.

State managed in URL search params so filters are shareable/bookmarkable.

### 3c. Admin product form — isPublished toggle + TipTap

Files to modify: `apps/web/src/features/admin/pages/AdminProductsPage.tsx` (or product form component)

Changes:
- Add `isPublished` toggle switch (publish / unpublish)
- Replace `<textarea>` for `descriptionHtml` with TipTap editor
- TipTap extensions: `StarterKit`, `Image` (upload to `/graphql` via existing upload mutation or direct to `/uploads`), `Link`
- TipTap toolbar: Bold, Italic, Bullet list, Ordered list, Image insert, Link

Package to add: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`

### 3d. Category nav — brand hierarchy

Files to modify: storefront category navigation component (sidebar/top nav)

Changes:
- Fetch `categoriesTree` query (already exists in schema) instead of flat `categories`
- Top-level items = brands; expandable to show children
- Clicking brand filters by brand categoryId; clicking subcategory filters by subcategory categoryId
- Breadcrumb on product detail: Brand → Subcategory → Product name
- Admin category form: add `parentId` select dropdown to make a category a subcategory of a brand

---

## 4. Data Flow

```
Customer visits /products
  → Apollo query: products(isPublished=true [server enforced], filters from URL params)
  → buildProductsQuery: filters by isPublished, categoryId, minPrice, maxPrice, skinType
  → Returns products; stock field = null for public
  → FilterSidebar reads URL params, updates Apollo variables on change
  → ProductCard renders without stock numbers or out-of-stock badges
```

```
Admin visits /admin/products
  → Apollo query: products (no isPublished filter, isAdmin context)
  → stock field returned with actual value
  → Product form shows isPublished toggle, TipTap editor for descriptionHtml
```

---

## 5. Error Handling

- If customer somehow adds a product that sells out during session: order creation returns error → cart shows "Бараа дууссан" toast, item removed from cart
- Filter params with invalid values (e.g. negative price) → silently ignored in query builder, no crash
- TipTap image upload failure → show error toast, image not inserted

---

## 6. Implementation Order

1. DB migration — `isPublished` column
2. API — `buildProductsQuery` updates (isPublished filter, new filter args, stock guard)
3. GraphQL codegen — run after schema changes
4. Admin form — `isPublished` toggle + TipTap editor
5. Storefront — remove stock display from ProductCard + ProductDetailPage
6. Storefront — `FilterSidebar` component
7. Storefront — category nav brand hierarchy
8. Admin — category form parentId support

---

## 7. Out of Scope (Phase 2+)

- Cash payment option
- Delivery rules (>200,000₮ free threshold)
- VIP/membership discounts
- Korea special orders
- Blog/content section
- Branding/logo changes
