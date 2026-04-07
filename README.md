# Mongol Beauty - E-commerce Platform

A monorepo beauty e-commerce platform built for Mongolian Gen Z users, featuring an order-centric Taobao-style flow with manual payment verification.

## 🏗️ Architecture

### Monorepo Structure
```
mongol-beauty/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── api/           # NestJS GraphQL backend
├── packages/
│   ├── ui/            # Shared Tailwind UI components
│   ├── types/         # Shared GraphQL & TypeScript types
│   └── config/        # Shared ESLint, TS, Tailwind config
└── package.json       # Yarn workspaces root
```

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Apollo Client** for GraphQL
- **React Router** for navigation

### Backend
- **NestJS** with TypeScript
- **GraphQL** (Apollo Server)
- **PostgreSQL** with TypeORM
- **File Upload** support for payment receipts

## 📋 Prerequisites

- Node.js 18+ and Yarn
- PostgreSQL 14+
- Git

## 🚀 Quick Start

See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide.
For full local setup and troubleshooting, see [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md).
For all docs, see [docs/README.md](./docs/README.md).

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker & Docker Compose

### Setup Steps

1. **Install dependencies**:
   ```bash
   yarn install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

3. **Start database**:
   ```bash
   yarn docker:up
   ```

4. **Start development servers**:
   ```bash
   yarn dev
   ```

5. **Access the application**:
   - **Frontend**: http://localhost:5173
   - **GraphQL Playground**: http://localhost:4000/graphql

For detailed setup instructions, see [docs/LOCAL_SETUP.md](./docs/LOCAL_SETUP.md).

## 📱 Features

### User Flow (Order-Centric)
1. **Browse Products** - Category-based navigation
2. **Add to Cart** - Simple cart management
3. **Create Order** - Order created before payment
4. **Payment** - Manual bank transfer
5. **Upload Receipt** - User uploads payment proof
6. **Admin Verification** - Admin confirms payment
7. **Order Tracking** - Status updates (WAITING_PAYMENT → CONFIRMED → SHIPPING → COMPLETED)

### Mobile-First UX
- Thumb-reachable CTAs (fixed bottom buttons)
- Bottom-sheet filters
- Toast notifications
- Safe area insets support
- Zero-friction checkout

## 🗄️ Database Schema

### Core Entities
- **Category** - Product categories
- **Product** - Beauty products with skin type and features
- **Order** - Orders with status tracking
- **OrderItem** - Order line items
- **User** - Lightweight user model (phone-based or guest)

### Order Status Flow
```
WAITING_PAYMENT → CONFIRMED → SHIPPING → COMPLETED
                      ↓
                  CANCELLED
```

## 📡 GraphQL API

### Key Queries
- `products(categoryId, limit, offset)` - List products
- `product(id)` - Get product details
- `categories` - List all categories
- `order(id)` - Get order details
- `orders` - List all orders

### Key Mutations
- `createOrder(input)` - Create new order
- `uploadPaymentReceipt(orderId, file)` - Upload payment proof
- `confirmPayment(orderId)` - Admin: confirm payment
- `updateOrderStatus(orderId, status)` - Admin: update status

See `apps/web/src/graphql/` for complete query/mutation examples.

## 🎨 UX Rationale for Mongolian Gen Z

1. **Mobile-First**: 90%+ of users access via mobile
2. **Thumb-Reachable CTAs**: Fixed bottom buttons for easy tapping
3. **Category > Brand**: Mongolian market prefers category browsing
4. **Simple Checkout**: Minimal friction, guest checkout supported
5. **Visual Product Focus**: Large images, clear pricing
6. **Status Transparency**: Clear order status with icons
7. **Mongolian Language Support**: UI labels in Mongolian (Нүүр, Бүтээгдэхүүн, etc.)

## 🔐 Admin Features (MVP)

- View all orders
- View payment receipts
- Confirm payments
- Update order status
- No payment gateway integration (manual verification)

## 📦 Build for Production

```bash
yarn build
```

This builds both frontend and backend.

## 🧪 Development Notes

### Adding New GraphQL Types
1. Update `packages/types/src/schema.graphql`
2. Run codegen: `yarn workspace @mongol-beauty/types codegen`
3. Types are auto-generated in `packages/types/src/generated/`

### Adding Shared Components
Add to `packages/ui/src/` and export from `index.ts`

### File Uploads
Payment receipts are stored in `apps/api/uploads/receipts/`. In production, use cloud storage (S3, Cloudinary, etc.).

## 🚧 Future Enhancements

- [ ] Authentication (phone-based OTP)
- [ ] Product search and filters
- [ ] Wishlist functionality
- [ ] Order history for users
- [ ] Admin dashboard UI
- [ ] Cloud storage for images
- [ ] SMS notifications
- [ ] Payment gateway integration (optional)

## 📄 License

Private - Mongol Beauty LLC

---

Built with ❤️ for Mongolian Gen Z beauty enthusiasts
