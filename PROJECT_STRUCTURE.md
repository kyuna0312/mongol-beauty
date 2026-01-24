# Project Structure

## Complete Monorepo Architecture

```
mongol-beauty/
├── apps/
│   ├── api/                    # NestJS GraphQL Backend
│   │   ├── src/
│   │   │   ├── admin/         # Admin module (order management)
│   │   │   ├── category/       # Category module
│   │   │   │   ├── category.entity.ts
│   │   │   │   ├── category.module.ts
│   │   │   │   ├── category.resolver.ts
│   │   │   │   └── category.service.ts
│   │   │   ├── order/          # Order module (core)
│   │   │   │   ├── dto/
│   │   │   │   │   └── create-order.input.ts
│   │   │   │   ├── order.entity.ts
│   │   │   │   ├── order-item.entity.ts
│   │   │   │   ├── order.module.ts
│   │   │   │   ├── order.resolver.ts
│   │   │   │   └── order.service.ts
│   │   │   ├── payment/        # Payment module
│   │   │   │   ├── payment.module.ts
│   │   │   │   ├── payment.resolver.ts
│   │   │   │   └── payment.service.ts
│   │   │   ├── product/       # Product module
│   │   │   ├── user/          # User module
│   │   │   ├── scalars/       # Custom GraphQL scalars
│   │   │   ├── app.module.ts  # Root module
│   │   │   └── main.ts        # Entry point
│   │   └── package.json
│   │
│   └── web/                    # React + Vite Frontend
│       ├── src/
│       │   ├── components/    # Reusable components
│       │   │   ├── Layout.tsx
│       │   │   ├── ProductCard.tsx
│       │   │   └── Toast.tsx
│       │   ├── pages/         # Page components
│       │   │   ├── HomePage.tsx
│       │   │   ├── ProductsPage.tsx
│       │   │   ├── ProductDetailPage.tsx
│       │   │   ├── CartPage.tsx
│       │   │   ├── CheckoutPage.tsx
│       │   │   └── OrderPage.tsx
│       │   ├── graphql/       # GraphQL queries/mutations
│       │   │   ├── queries.ts
│       │   │   └── mutations.ts
│       │   ├── lib/           # Utilities
│       │   │   └── apollo.ts  # Apollo Client setup
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css      # Tailwind styles
│       └── package.json
│
├── packages/
│   ├── config/                # Shared configurations
│   │   └── src/
│   │       ├── tailwind.config.ts
│   │       └── eslint.config.js
│   │
│   ├── types/                 # Shared types & GraphQL schema
│   │   ├── src/
│   │   │   ├── schema.graphql # GraphQL schema
│   │   │   └── types.ts       # TypeScript types
│   │   └── codegen.yml        # GraphQL codegen config
│   │
│   └── ui/                    # Shared UI components
│       └── src/
│           ├── Button.tsx
│           ├── Card.tsx
│           └── index.ts
│
├── package.json               # Root workspace config
├── tsconfig.base.json         # Base TypeScript config
├── README.md                  # Main documentation
└── SETUP.md                   # Quick setup guide
```

## Key Features Implemented

### ✅ Backend (NestJS + GraphQL)
- [x] GraphQL API with Apollo Server
- [x] PostgreSQL database with TypeORM
- [x] All required modules (Product, Category, Order, Payment, User, Admin)
- [x] Order-centric flow (order created before payment)
- [x] Manual payment verification
- [x] File upload for payment receipts
- [x] GraphQL schema with proper types
- [x] Database entities with relationships

### ✅ Frontend (React + Vite)
- [x] Mobile-first responsive design
- [x] Apollo Client for GraphQL
- [x] React Router for navigation
- [x] Tailwind CSS for styling
- [x] All required pages (Home, Products, Cart, Checkout, Order)
- [x] Thumb-reachable CTAs (fixed bottom buttons)
- [x] Bottom-sheet filters
- [x] Toast notifications
- [x] Product browsing and cart management

### ✅ Shared Packages
- [x] UI components package
- [x] Types package with GraphQL schema
- [x] Config package for shared configs

### ✅ UX Features
- [x] Mobile-first design
- [x] Category-based navigation
- [x] Zero-friction checkout
- [x] Order status tracking
- [x] Payment receipt upload
- [x] Mongolian language labels

## GraphQL API Endpoints

### Queries
- `products(categoryId, limit, offset)` - List products
- `product(id)` - Get product details
- `categories` - List all categories
- `category(id)` - Get category details
- `order(id)` - Get order details
- `orders` - List all orders
- `me` - Get current user

### Mutations
- `createOrder(input)` - Create new order
- `uploadPaymentReceipt(orderId, file)` - Upload payment proof
- `confirmPayment(orderId)` - Admin: confirm payment
- `updateOrderStatus(orderId, status)` - Admin: update status

## Database Schema

### Entities
1. **Category** - Product categories
2. **Product** - Beauty products with skin type, features, images
3. **Order** - Orders with status (WAITING_PAYMENT → CONFIRMED → SHIPPING → COMPLETED)
4. **OrderItem** - Order line items
5. **User** - Lightweight user model (phone-based or guest)

### Relationships
- Category → Products (One-to-Many)
- Product → Category (Many-to-One)
- Order → OrderItems (One-to-Many)
- Order → User (Many-to-One, optional)
- OrderItem → Product (Many-to-One)

## Order Flow

1. User browses products
2. Adds items to cart
3. Creates order (status: WAITING_PAYMENT)
4. Receives bank transfer info
5. Uploads payment receipt
6. Admin verifies payment
7. Status updates: CONFIRMED → SHIPPING → COMPLETED

## Next Steps for Production

1. Add authentication (phone-based OTP)
2. Implement admin dashboard UI
3. Add product search and advanced filters
4. Set up cloud storage for images (S3, Cloudinary)
5. Add SMS notifications
6. Implement order history for users
7. Add wishlist functionality
8. Set up CI/CD pipeline
9. Add error monitoring (Sentry)
10. Performance optimization
