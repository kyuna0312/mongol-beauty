# Demo Seed Data

Run `yarn seed` to populate the database with demo products, categories, and accounts.

## Demo Accounts

| Role | Email | Password | Login URL |
|------|-------|----------|-----------|
| Admin | `admin@incellderm.mn` | `admin123` | `/admin/login` |
| Storefront user | `demo@mongol-beauty.local` | `demo1234` | `/login` |

To create accounts separately:

```bash
yarn create-admin        # Admin account only
yarn create-demo-user    # Storefront user only
```

## Categories and Products

### Facial Skincare (Нүүр арьсны эм)

- Hyaluronic Acid Serum — 45,000₮
- Vitamin C Brightening Cream — 55,000₮
- Niacinamide Acne Control Gel — 38,000₮
- Retinol Anti-Aging Night Cream — 68,000₮
- SPF 50+ Sunscreen Lotion — 42,000₮

### Makeup (Гоо сайхны бүтээгдэхүүн)

- Matte Lipstick Set (6 colors) — 35,000₮
- BB Cream Natural Finish — 28,000₮
- Eyeshadow Palette (Sunset Colors) — 45,000₮
- Mascara Volume & Length — 22,000₮

### Hair Care (Үс арчилгаа)

- Argan Oil Hair Mask — 32,000₮
- Keratin Repair Shampoo — 25,000₮
- Coconut Oil Hair Serum — 18,000₮

### Body Care (Бие арчилгаа)

- Shea Butter Body Lotion — 28,000₮
- Exfoliating Body Scrub — 35,000₮
- Lavender Relaxing Body Oil — 42,000₮

### Spa & Wellness (Амралтын бүтээгдэхүүн)

- Rose Quartz Face Roller — 38,000₮
- Jade Gua Sha Tool — 32,000₮
- Aromatherapy Essential Oil Set — 55,000₮

## Reset Demo Data

```bash
yarn docker:clean   # Wipe DB volume
yarn docker:up      # Restart DB
yarn seed           # Re-seed everything
```

## Customizing Seed Data

Edit `apps/api/src/scripts/seed.ts` to add or modify products.

## Verifying the Data

```graphql
query {
  products(limit: 5) {
    name
    price
    category { name }
  }
}
```

Open http://localhost:4000/graphql to run queries, or check http://localhost:5173 to see products in the storefront.
