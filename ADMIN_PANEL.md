# Admin Panel

The admin panel runs at `/admin` and is protected by JWT-based authentication. Admin accounts are separate from storefront user accounts.

## Access

- URL: `http://localhost:5173/admin`
- Login: `http://localhost:5173/admin/login`
- Default credentials (after running `yarn create-admin`): `admin@incellderm.mn` / `admin123`

**Change the default password immediately in any non-local environment.**

## Features

### Dashboard

- Order statistics: total, pending, revenue
- Recent orders (latest 5 with status)
- Low stock alerts (products with stock < 10)
- Quick links to create products and categories

### Products

- List all products with images, prices, stock, and categories
- Create and edit products: name, category, price, stock, description, skin types, features, images
- Delete products (with confirmation)
- Toggle product visibility

### Categories

- List all categories with images and product counts
- Create, edit, and delete categories
- Fields: name, slug, description, image URL

### Orders

- List all orders with customer info, items, totals, and receipt links
- Filter by status
- Status transitions:
  - `WAITING_PAYMENT` → confirm payment → `PAID_CONFIRMED`
  - `PAID_CONFIRMED` → ship → `SHIPPING`
  - `SHIPPING` → complete → `COMPLETED`
  - Any active status → `CANCELLED`

### Site Settings

- Delivery fee and free-delivery threshold
- Bank account information for transfers

### User Management

- View all users
- Update subscription tier (`FREE` / `PREMIUM`)

## Navigation

- **Desktop**: Sidebar on the left
- **Mobile**: Bottom navigation bar

## File Structure

```
apps/web/src/
├── features/admin/
│   └── pages/
│       ├── AdminDashboardPage.tsx
│       ├── AdminProductsPage.tsx
│       ├── AdminProductFormPage.tsx
│       ├── AdminCategoriesPage.tsx
│       ├── AdminCategoryFormPage.tsx
│       └── AdminOrdersPage.tsx
└── components/admin/
    └── AdminLayout.tsx

apps/api/src/
├── admin/
│   ├── admin.resolver.ts
│   └── admin.service.ts
├── product/
│   ├── dto/create-product.input.ts
│   ├── product.resolver.ts
│   └── product.service.ts
└── category/
    ├── dto/create-category.input.ts
    ├── category.resolver.ts
    └── category.service.ts
```

## GraphQL Operations

```graphql
# Queries
adminOrders(status: OrderStatus, limit: Int, offset: Int): [Order!]!
adminOrderStats: OrderStats!
adminProducts(...): [Product!]!
adminProductsPaged(...): ProductPage!

# Product mutations
createProduct(input: CreateProductInput!): Product!
updateProduct(input: UpdateProductInput!): Product!
deleteProduct(id: ID!): Boolean!

# Category mutations
createCategory(input: CreateCategoryInput!): Category!
updateCategory(input: UpdateCategoryInput!): Category!
deleteCategory(id: ID!): Boolean!

# Order mutations
confirmPayment(orderId: ID!): Order!
updateOrderStatus(orderId: ID!, status: OrderStatus!): Order!

# User mutations
updateUserSubscription(userId: ID!, userType: UserType!): User!

# Settings mutations
updateSiteSettings(input: SiteSettingsInput!): SiteSettings!
```
