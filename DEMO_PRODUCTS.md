# Demo Products - Mongol Beauty

## ✅ Demo Data Created Successfully!

Your database has been populated with **18 demo products** across **5 categories**.

## 📦 Categories Created

1. **Нүүр арьсны эм** (Facial Skincare) - 5 products
2. **Гоо сайхны бүтээгдэхүүн** (Makeup) - 4 products
3. **Үс арчилгаа** (Hair Care) - 3 products
4. **Бие арчилгаа** (Body Care) - 3 products
5. **Амралтын бүтээгдэхүүн** (Spa & Wellness) - 3 products

## 🛍️ Products Created

### Facial Skincare (5 products)
- Hyaluronic Acid Serum - 45,000₮
- Vitamin C Brightening Cream - 55,000₮
- Niacinamide Acne Control Gel - 38,000₮
- Retinol Anti-Aging Night Cream - 68,000₮
- SPF 50+ Sunscreen Lotion - 42,000₮

### Makeup (4 products)
- Matte Lipstick Set (6 colors) - 35,000₮
- BB Cream Natural Finish - 28,000₮
- Eyeshadow Palette - Sunset Colors - 45,000₮
- Mascara Volume & Length - 22,000₮

### Hair Care (3 products)
- Argan Oil Hair Mask - 32,000₮
- Keratin Repair Shampoo - 25,000₮
- Coconut Oil Hair Serum - 18,000₮

### Body Care (3 products)
- Shea Butter Body Lotion - 28,000₮
- Exfoliating Body Scrub - 35,000₮
- Lavender Relaxing Body Oil - 42,000₮

### Spa & Wellness (3 products)
- Rose Quartz Face Roller - 38,000₮
- Jade Gua Sha Tool - 32,000₮
- Aromatherapy Essential Oil Set - 55,000₮

## 🚀 How to Use

### View Products in GraphQL Playground

1. **Start your backend** (if not running):
   ```bash
   yarn dev:api
   ```

2. **Open GraphQL Playground**:
   ```
   http://localhost:4000/graphql
   ```

3. **Query products**:
   ```graphql
   query {
     products {
       id
       name
       price
       stock
       description
       images
       category {
         name
       }
     }
   }
   ```

4. **Query categories**:
   ```graphql
   query {
     categories {
       id
       name
       slug
       imageUrl
       products {
         id
         name
         price
       }
     }
   }
   ```

### Re-seed Database

If you want to reset and re-seed:
```bash
# From root
yarn seed

# Or from API directory
cd apps/api
yarn seed
```

## 📝 Product Features

All products include:
- ✅ **Mongolian descriptions** - Gen Z friendly
- ✅ **Realistic prices** - In Mongolian Tugrik (₮)
- ✅ **Stock levels** - Varying quantities
- ✅ **Skin types** - Properly categorized
- ✅ **Features** - Anti-aging, hydrating, brightening, etc.
- ✅ **Images** - Placeholder images from Unsplash
- ✅ **Categories** - Properly linked

## 🎨 Customization

To add more products, edit:
```
apps/api/src/scripts/seed.ts
```

Add products to the `products` array with the same structure.

## ✅ Verification

You can verify the data was created by:

1. **GraphQL Query**:
   ```graphql
   query {
     products(limit: 5) {
       name
       price
       category {
         name
       }
     }
   }
   ```

2. **Check your frontend**:
   - Start frontend: `yarn dev:web`
   - Visit: `http://localhost:5173`
   - You should see products on the home page!

## 🎉 Next Steps

1. **View in Frontend**: Start your web app and see the products
2. **Test Cart**: Add products to cart
3. **Test Checkout**: Create test orders
4. **Customize**: Add your own products to the seed file

---

**Your demo store is ready! 🛍️✨**
