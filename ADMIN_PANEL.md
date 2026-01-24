# Admin Panel Documentation

## Overview

A complete admin panel has been created for managing products, categories, and orders in the Mongol Beauty e-commerce platform.

## Features

### 🎯 Dashboard
- **Statistics Overview**: Total orders, pending orders, products count, revenue
- **Quick Actions**: Create new products/categories
- **Recent Orders**: Latest 5 orders with status
- **Low Stock Alerts**: Warnings for products with stock < 10

### 📦 Products Management
- **List View**: All products with images, prices, stock, categories
- **Create Product**: Full form with:
  - Name, category, price, stock
  - Description
  - Skin type selection (OILY, DRY, COMBINATION, SENSITIVE, NORMAL)
  - Features (ANTI_AGING, HYDRATING, BRIGHTENING, etc.)
  - Multiple image URLs
- **Edit Product**: Update existing products
- **Delete Product**: Remove products with confirmation

### 📁 Categories Management
- **List View**: All categories with images and product counts
- **Create Category**: Name, slug, description, image URL
- **Edit Category**: Update category details
- **Delete Category**: Remove categories with confirmation

### 🛒 Orders Management
- **List View**: All orders with:
  - Order ID, status, total price
  - Customer information
  - Order items
  - Payment receipt links
- **Status Filtering**: Filter by order status
- **Status Updates**: 
  - Confirm payment (WAITING_PAYMENT → CONFIRMED)
  - Ship order (CONFIRMED → SHIPPING)
  - Complete order (SHIPPING → COMPLETED)
  - Cancel order

## Access

Visit: `http://localhost:5173/admin`

## Navigation

### Desktop
- Sidebar navigation on the left
- All admin sections accessible

### Mobile
- Bottom navigation bar
- Mobile-optimized layouts
- Touch-friendly buttons

## GraphQL Mutations

### Products
```graphql
mutation CreateProduct($input: CreateProductInput!) {
  createProduct(input: $input) { ... }
}

mutation UpdateProduct($input: UpdateProductInput!) {
  updateProduct(input: $input) { ... }
}

mutation DeleteProduct($id: ID!) {
  deleteProduct(id: $id)
}
```

### Categories
```graphql
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) { ... }
}

mutation UpdateCategory($input: UpdateCategoryInput!) {
  updateCategory(input: $input) { ... }
}

mutation DeleteCategory($id: ID!) {
  deleteCategory(id: $id)
}
```

### Orders
```graphql
query GetAdminOrders {
  adminOrders { ... }
}

mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
  updateOrderStatus(orderId: $orderId, status: $status) { ... }
}
```

## File Structure

```
apps/web/src/
├── pages/admin/
│   ├── AdminDashboard.tsx          # Dashboard with stats
│   ├── AdminProductsPage.tsx       # Products list
│   ├── AdminProductFormPage.tsx    # Create/Edit product
│   ├── AdminCategoriesPage.tsx     # Categories list
│   ├── AdminCategoryFormPage.tsx   # Create/Edit category
│   └── AdminOrdersPage.tsx         # Orders management
└── components/admin/
    └── AdminLayout.tsx              # Admin layout with navigation

apps/api/src/
├── product/
│   ├── dto/create-product.input.ts  # Product input types
│   ├── product.resolver.ts         # Product mutations
│   └── product.service.ts           # Product CRUD logic
├── category/
│   ├── dto/create-category.input.ts # Category input types
│   ├── category.resolver.ts         # Category mutations
│   └── category.service.ts          # Category CRUD logic
└── admin/
    ├── admin.resolver.ts            # Admin queries
    └── admin.service.ts             # Admin logic
```

## Usage Examples

### Create a Product
1. Navigate to `/admin/products`
2. Click "Шинэ бүтээгдэхүүн" (New Product)
3. Fill in the form:
   - Name: "Vitamin C Serum"
   - Category: Select from dropdown
   - Price: 45000
   - Stock: 50
   - Select skin types and features
   - Add image URLs
4. Click "Үүсгэх" (Create)

### Update Order Status
1. Navigate to `/admin/orders`
2. Find the order
3. Click status button:
   - "Баталгаажуулах" (Confirm) for WAITING_PAYMENT
   - "Хүргэлтэд гаргах" (Ship) for CONFIRMED
   - "Дуусгах" (Complete) for SHIPPING

## Security Note

⚠️ **Important**: Currently, the admin panel has no authentication. In production, you should:
- Add authentication/authorization
- Protect admin routes with guards
- Add role-based access control
- Implement session management

## Mobile-First Design

The admin panel is fully responsive:
- Mobile: Bottom navigation, stacked layouts
- Desktop: Sidebar navigation, grid layouts
- Touch-friendly buttons and forms
- Optimized for small screens

## Next Steps

1. Add authentication
2. Add user management
3. Add analytics/reports
4. Add bulk operations
5. Add image upload (currently uses URLs)
6. Add export functionality
