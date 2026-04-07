import { DataSource } from 'typeorm';
import { Category } from '../category/category.entity';
import { Product, SkinType, Feature } from '../product/product.entity';
import { join } from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });

// Simple seed script that uses direct SQL-like approach
const categories = [
  {
    name: 'Нүүр арьсны эм',
    slug: 'facial-skincare',
    description: 'Нүүр арьсны эм, тос, лосьон',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
  },
  {
    name: 'Гоо сайхны бүтээгдэхүүн',
    slug: 'makeup',
    description: 'Гоо сайхны бүтээгдэхүүн, будаг',
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
  },
  {
    name: 'Үс арчилгаа',
    slug: 'hair-care',
    description: 'Үсний шампунь, бальзам, маск',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
  },
  {
    name: 'Бие арчилгаа',
    slug: 'body-care',
    description: 'Биеийн тос, лосьон, гель',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  },
  {
    name: 'Амралтын бүтээгдэхүүн',
    slug: 'spa-wellness',
    description: 'Амралт, тайвшрал, сайхны бүтээгдэхүүн',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400',
  },
];

const products = [
  // Facial Skincare
  {
    name: 'Hyaluronic Acid Serum',
    price: 45000,
    stock: 50,
    description: 'Чанартай гиалуроны хүчил агуулсан серум. Арьсыг чийгшүүлж, гөлгөр болгодог. Gen Z-д зориулсан шинэлэг томьёо.',
    skinType: [SkinType.DRY, SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.HYDRATING, Feature.BRIGHTENING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
    categorySlug: 'facial-skincare',
  },
  {
    name: 'Vitamin C Brightening Cream',
    price: 55000,
    stock: 30,
    description: 'C витамин агуулсан гэрэлтүүлэх тос. Арьсыг гэрэлтүүлж, толбо арилгана.',
    skinType: [SkinType.NORMAL, SkinType.COMBINATION, SkinType.SENSITIVE],
    features: [Feature.BRIGHTENING, Feature.ANTI_AGING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'facial-skincare',
  },
  {
    name: 'Niacinamide Acne Control Gel',
    price: 38000,
    stock: 75,
    description: 'Ниацинамид агуулсан батганы эсрэг гель. Тослог арьсанд тохиромжтой.',
    skinType: [SkinType.OILY, SkinType.COMBINATION],
    features: [Feature.ACNE_FIGHTING, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600'],
    categorySlug: 'facial-skincare',
  },
  {
    name: 'Retinol Anti-Aging Night Cream',
    price: 68000,
    stock: 25,
    description: 'Ретинол агуулсан шөнийн тос. Насны шинж тэмдгийг бууруулна.',
    skinType: [SkinType.DRY, SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.ANTI_AGING, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'facial-skincare',
  },
  {
    name: 'SPF 50+ Sunscreen Lotion',
    price: 42000,
    stock: 60,
    description: 'SPF 50+ нарны хамгаалалтын лосьон. Өдөр бүр хэрэглэхэд тохиромжтой.',
    skinType: [SkinType.NORMAL, SkinType.DRY, SkinType.OILY, SkinType.COMBINATION, SkinType.SENSITIVE],
    features: [Feature.SUNSCREEN, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'facial-skincare',
  },
  
  // Makeup
  {
    name: 'Matte Lipstick Set (6 colors)',
    price: 35000,
    stock: 40,
    description: '6 өнгийн мат уруулын будаг. Удаан барьдаг, байгалийн найрлагатай.',
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
    categorySlug: 'makeup',
  },
  {
    name: 'BB Cream Natural Finish',
    price: 28000,
    stock: 55,
    description: 'Байгалийн гэрэлтэлттэй BB крем. Нимгэн давхарга, SPF 30.',
    skinType: [SkinType.NORMAL, SkinType.DRY, SkinType.COMBINATION],
    features: [Feature.SUNSCREEN, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
    categorySlug: 'makeup',
  },
  {
    name: 'Eyeshadow Palette - Sunset Colors',
    price: 45000,
    stock: 35,
    description: '12 өнгийн нүдний будаг. Нар жаргах өнгөтэй палитр. Gen Z-ийн дуртай.',
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=600'],
    categorySlug: 'makeup',
  },
  {
    name: 'Mascara Volume & Length',
    price: 22000,
    stock: 70,
    description: 'Хэмжээ, урт нэмэгдүүлэх сурвалжлагч. Удаан барьдаг, усанд тэсвэртэй.',
    skinType: [],
    features: [],
    images: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600'],
    categorySlug: 'makeup',
  },
  
  // Hair Care
  {
    name: 'Argan Oil Hair Mask',
    price: 32000,
    stock: 45,
    description: 'Арганы тос агуулсан үсний маск. Хатсан үсийг сэргээж, гөлгөр болгодог.',
    skinType: [],
    features: [Feature.HYDRATING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
    categorySlug: 'hair-care',
  },
  {
    name: 'Keratin Repair Shampoo',
    price: 25000,
    stock: 80,
    description: 'Кератин агуулсан сэргээх шампунь. Эвдэрсэн үсийг засварлана.',
    skinType: [],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
    categorySlug: 'hair-care',
  },
  {
    name: 'Coconut Oil Hair Serum',
    price: 18000,
    stock: 90,
    description: 'Кокосын тос агуулсан үсний серум. Гөлгөр, гэрэлтүүлэх эффект.',
    skinType: [],
    features: [Feature.HYDRATING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'hair-care',
  },
  
  // Body Care
  {
    name: 'Shea Butter Body Lotion',
    price: 28000,
    stock: 65,
    description: 'Ши тос агуулсан биеийн лосьон. Хатсан арьсыг чийгшүүлнэ.',
    skinType: [SkinType.DRY, SkinType.NORMAL],
    features: [Feature.HYDRATING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'body-care',
  },
  {
    name: 'Exfoliating Body Scrub',
    price: 35000,
    stock: 50,
    description: 'Биеийн арьс хайлуулах скраб. Гөлгөр, цэвэрхэн арьс.',
    skinType: [SkinType.NORMAL, SkinType.OILY],
    features: [Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600'],
    categorySlug: 'body-care',
  },
  {
    name: 'Lavender Relaxing Body Oil',
    price: 42000,
    stock: 40,
    description: 'Лаванда агуулсан тайвшруулах биеийн тос. Амралт, тайвшрал өгнө.',
    skinType: [SkinType.DRY, SkinType.NORMAL, SkinType.SENSITIVE],
    features: [Feature.HYDRATING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'body-care',
  },
  
  // Spa & Wellness
  {
    name: 'Rose Quartz Face Roller',
    price: 38000,
    stock: 30,
    description: 'Ягаан кварц нүүрний роллер. Цусны эргэлтийг сайжруулж, хавдалт бууруулна.',
    skinType: [SkinType.NORMAL, SkinType.SENSITIVE],
    features: [Feature.ANTI_AGING],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600'],
    categorySlug: 'spa-wellness',
  },
  {
    name: 'Jade Gua Sha Tool',
    price: 32000,
    stock: 35,
    description: 'Нефрит гуа ша багаж. Хуучин соёл, орчин үеийн гоо сайхан.',
    skinType: [SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.ANTI_AGING, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'spa-wellness',
  },
  {
    name: 'Aromatherapy Essential Oil Set',
    price: 55000,
    stock: 25,
    description: '5 төрлийн эфирийн тосны багц. Амралт, эрч хүч, тайвшрал.',
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600'],
    categorySlug: 'spa-wellness',
  },
];

async function seed() {
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: dbPort,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mongol_beauty',
    entities: [join(__dirname, '../**/*.entity.{ts,js}')],
    synchronize: false,
    logging: false, // Set to true for debugging
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const categoryRepository = dataSource.getRepository(Category);
    const productRepository = dataSource.getRepository(Product);

    // Clear existing data (respect FK order: cart/order lines before products)
    console.log('🗑️  Clearing existing data...');
    await dataSource.query('DELETE FROM cart_items').catch(() => undefined);
    await dataSource.query('DELETE FROM order_items').catch(() => undefined);
    await dataSource.query('DELETE FROM orders').catch(() => undefined);

    const existingProducts = await productRepository.find();
    const existingCategories = await categoryRepository.find();

    if (existingProducts.length > 0) {
      await productRepository.remove(existingProducts);
    }
    if (existingCategories.length > 0) {
      await categoryRepository.remove(existingCategories);
    }
    console.log('✅ Existing data cleared');

    // Create categories
    console.log('📦 Creating categories...');
    const createdCategories: Category[] = [];
    for (const catData of categories) {
      const category = categoryRepository.create(catData);
      const saved = await categoryRepository.save(category);
      createdCategories.push(saved);
      console.log(`  ✅ Created category: ${saved.name}`);
    }

    // Create products
    console.log('🛍️  Creating products...');
    let productCount = 0;
    for (const prodData of products) {
      const category = createdCategories.find(c => c.slug === prodData.categorySlug);
      if (!category) {
        console.warn(`  ⚠️  Category not found: ${prodData.categorySlug}`);
        continue;
      }

      const product = new Product();
      product.name = prodData.name;
      product.price = prodData.price;
      product.stock = prodData.stock;
      product.description = prodData.description;
      product.categoryId = category.id;
      product.skinType = prodData.skinType.join(',') as any;
      product.features = prodData.features.join(',') as any;
      product.images = prodData.images.join(',') as any;

      await productRepository.save(product);
      productCount++;
      console.log(`  ✅ Created product: ${product.name} (${product.price}₮)`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${productCount}`);
    console.log('\n💡 You can now view products in your GraphQL Playground:');
    console.log('   http://localhost:4000/graphql');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  seed();
}

export { seed };
