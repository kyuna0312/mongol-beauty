import { DataSource } from 'typeorm';
import { Category } from '../category/category.entity';
import { Product, SkinType, Feature } from '../product/product.entity';
import { join } from 'path';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env') });
config({ path: resolve(__dirname, '../../.env') });

/** Riman KR reference (official product pages). */
const riman = (id: string) => `https://kr.riman.com/product/detail/${id}`;

const categories = [
  {
    name: 'INCELLDERM',
    slug: 'incellderm',
    description: 'INCELLDERM гоо сайхны бүтээгдэхүүн (Riman жагсаалт)',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400',
  },
  {
    name: 'BOTALAB',
    slug: 'botalab',
    description: 'BOTALAB үс, бие, амны эрүүл мэнд (Riman жагсаалт)',
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
  },
  {
    name: 'LIFE',
    slug: 'life',
    description: 'LIFE эрүүл мэнд, нэмэлт тэжээл (Riman жагсаалт)',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  },
];

type SeedProduct = {
  name: string;
  price: number;
  stock: number;
  description: string;
  skinType: SkinType[];
  features: Feature[];
  images: string[];
  categorySlug: 'incellderm' | 'botalab' | 'life';
};

const products: SeedProduct[] = [
  {
    name: 'Dermatology First Package',
    price: 279_000,
    stock: 40,
    description: `INCELLDERM — Анхны багц. Лавлагаа: ${riman('7223342')}`,
    skinType: [SkinType.NORMAL, SkinType.COMBINATION, SkinType.DRY],
    features: [Feature.HYDRATING, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Dermatology Cream',
    price: 189_000,
    stock: 45,
    description: `Лавлагаа: ${riman('7158374')}`,
    skinType: [SkinType.DRY, SkinType.NORMAL, SkinType.SENSITIVE],
    features: [Feature.HYDRATING, Feature.ANTI_AGING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Two Phase Oil Mist',
    price: 109_000,
    stock: 60,
    description: `Лавлагаа: ${riman('7234469')}`,
    skinType: [SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Calming Balance Gel',
    price: 109_000,
    stock: 55,
    description: `Лавлагаа: ${riman('7357466')}`,
    skinType: [SkinType.SENSITIVE, SkinType.COMBINATION],
    features: [Feature.HYDRATING, Feature.ACNE_FIGHTING],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Cleasing Powder Wash',
    price: 89_000,
    stock: 70,
    description: `Угаалгын нунтаг. Лавлагаа: ${riman('7356577')}`,
    skinType: [SkinType.OILY, SkinType.COMBINATION],
    features: [Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Sheer Glow BB',
    price: 89_000,
    stock: 65,
    description: `BB крем. Лавлагаа: ${riman('7353904')}`,
    skinType: [SkinType.NORMAL, SkinType.DRY, SkinType.COMBINATION],
    features: [Feature.BRIGHTENING, Feature.SUNSCREEN],
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Moisture layer sun protector',
    price: 89_000,
    stock: 50,
    description: `Нарны хамгаалалт. Лавлагаа: ${riman('7379270')}`,
    skinType: [SkinType.NORMAL, SkinType.OILY, SkinType.COMBINATION],
    features: [Feature.SUNSCREEN, Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Luminous moist cushion',
    price: 169_000,
    stock: 35,
    description: `Кушион. Лавлагаа: ${riman('7889985')}`,
    skinType: [SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.BRIGHTENING, Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Multi stick balm',
    price: 79_000,
    stock: 48,
    description: `Лавлагаа: ${riman('7379255')}`,
    skinType: [SkinType.DRY, SkinType.NORMAL],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Moisture cleansing oil',
    price: 89_000,
    stock: 58,
    description: `Угаалгын тос. Лавлагаа: ${riman('7171995')}`,
    skinType: [SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Collagen 100 melting mask',
    price: 179_000,
    stock: 32,
    description: `Маск. Лавлагаа: ${riman('7589644')}`,
    skinType: [SkinType.DRY, SkinType.NORMAL, SkinType.COMBINATION],
    features: [Feature.HYDRATING, Feature.ANTI_AGING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Lip oil',
    price: 89_000,
    stock: 72,
    description: `Уруулын тос. Лавлагаа: ${riman('7082383')}`,
    skinType: [],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Lip tint',
    price: 89_000,
    stock: 68,
    description: `Лавлагаа: ${riman('7085891')} · ${riman('7085838')}`,
    skinType: [],
    features: [Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1512496015851-a90fb38c796f?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Radiansome toner',
    price: 215_000,
    stock: 28,
    description: `Лавлагаа: ${riman('7865136')}`,
    skinType: [SkinType.NORMAL, SkinType.DRY, SkinType.COMBINATION],
    features: [Feature.HYDRATING, Feature.BRIGHTENING],
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Radiansome cream',
    price: 255_000,
    stock: 26,
    description: `Лавлагаа: ${riman('7865153')}`,
    skinType: [SkinType.DRY, SkinType.NORMAL],
    features: [Feature.HYDRATING, Feature.ANTI_AGING],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Radiansome Essence',
    price: 285_000,
    stock: 24,
    description: `Лавлагаа: ${riman('7865162')}`,
    skinType: [SkinType.NORMAL, SkinType.COMBINATION, SkinType.DRY],
    features: [Feature.HYDRATING, Feature.BRIGHTENING, Feature.ANTI_AGING],
    images: ['https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600'],
    categorySlug: 'incellderm',
  },
  {
    name: 'Shampoo',
    price: 99_000,
    stock: 80,
    description: `Шампунь. Лавлагаа: ${riman('6821036')}`,
    skinType: [],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Conditioner',
    price: 89_000,
    stock: 75,
    description: `Бальзам. Лавлагаа: ${riman('6821036')}`,
    skinType: [],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Hair serum',
    price: 109_000,
    stock: 62,
    description: `Үсний серум. Лавлагаа: ${riman('6821037')}`,
    skinType: [],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Body Wash',
    price: 89_000,
    stock: 70,
    description: `Биеийн гель. Лавлагаа: ${riman('6821037')}`,
    skinType: [],
    features: [Feature.HYDRATING, Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Body Cream',
    price: 89_000,
    stock: 66,
    description: `Лавлагаа: ${riman('7843212')}`,
    skinType: [SkinType.DRY, SkinType.NORMAL],
    features: [Feature.HYDRATING],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Toothpaste 4sh',
    price: 48_000,
    stock: 100,
    description: `Шүдний оо 4ш. Лавлагаа: ${riman('7788866')}`,
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Toothbrush 4sh',
    price: 16_000,
    stock: 120,
    description: `Сойз 4ш. Лавлагаа: ${riman('7788857')}`,
    skinType: [],
    features: [],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'botalab',
  },
  {
    name: 'Deep talk Plus',
    price: 350_000,
    stock: 20,
    description: `Лавлагаа: ${riman('6845504')}`,
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600'],
    categorySlug: 'life',
  },
  {
    name: 'Fit Shake',
    price: 250_000,
    stock: 25,
    description: 'Эрүүл мэндийн нэмэлт. Албан ёсны хуудасны холбоос жагсаалтад ороогүй.',
    skinType: [],
    features: [Feature.ORGANIC],
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600'],
    categorySlug: 'life',
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
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const categoryRepository = dataSource.getRepository(Category);
    const productRepository = dataSource.getRepository(Product);

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

    console.log('📦 Creating categories...');
    const createdCategories: Category[] = [];
    for (const catData of categories) {
      const category = categoryRepository.create(catData);
      const saved = await categoryRepository.save(category);
      createdCategories.push(saved);
      console.log(`  ✅ ${saved.name}`);
    }

    console.log('🛍️  Creating products (INCELLDERM / BOTALAB / LIFE)...');
    let productCount = 0;
    for (const prodData of products) {
      const category = createdCategories.find((c) => c.slug === prodData.categorySlug);
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
      product.skinType = prodData.skinType;
      product.features = prodData.features;
      product.images = prodData.images;

      await productRepository.save(product);
      productCount++;
      console.log(`  ✅ ${product.name} — ${product.price.toLocaleString()}₮`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log(`   Categories: ${createdCategories.length}`);
    console.log(`   Products: ${productCount}`);
    console.log('   GraphQL: http://localhost:4000/graphql\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  void seed();
}

export { seed };
