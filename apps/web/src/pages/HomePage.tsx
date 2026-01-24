import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { memo, useMemo, useEffect, useState } from 'react';
import { ProductCard, setCartToastCallback, ProductListSkeleton, OptimizedImage, CartToast } from '@mongol-beauty/ui';
import { PRODUCT_CARD_FRAGMENT } from '../graphql/fragments';
import { Button } from '@mongol-beauty/ui';
import { ArrowRight } from 'lucide-react';
import { ErrorDisplay } from '../components/ErrorDisplay';

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      imageUrl
    }
  }
`;

const GET_FEATURED_PRODUCTS = gql`
  query GetFeaturedProducts {
    products(limit: 8) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export const HomePage = memo(function HomePage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: categoriesData, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-first', // Cache categories as they don't change often
    errorPolicy: 'all',
  });
  
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_FEATURED_PRODUCTS, {
    fetchPolicy: 'cache-and-network', // Allow cache but refresh in background
    errorPolicy: 'all',
  });

  useEffect(() => {
    setCartToastCallback((message) => {
      setToastMessage(message);
    });
  }, []);

  // Memoize categories and products to prevent unnecessary re-renders
  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);
  const products = useMemo(() => productsData?.products || [], [productsData]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        <ProductListSkeleton />
      </div>
    );
  }

  if (categoriesError || productsError) {
    return (
      <ErrorDisplay
        title="Мэдээлэл ачаалахад алдаа гарлаа"
        message="Нүүр хуудсын мэдээллийг ачаалахад алдаа гарсан байна. Дахин оролдоно уу."
        showRem={true}
        showRam={true}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Section - INCELLDERM Style */}
      <section className="mb-8">
        <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
          {/* Decorative gold elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400 opacity-20 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-300 opacity-20 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">✨</span>
              <h2 className="text-3xl font-bold">Гоё сайхан гоо сайхны бүтээгдэхүүн</h2>
            </div>
            <p className="text-lg text-white/90 mb-4">Gen Z-д зориулсан шинэлэг бүтээгдэхүүн 💖</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-gold-500/30 backdrop-blur-sm border border-gold-400/50 px-3 py-1 rounded-full text-gold-100 font-medium">🚚 Хүргэлт үнэгүй</span>
              <span className="bg-gold-500/30 backdrop-blur-sm border border-gold-400/50 px-3 py-1 rounded-full text-gold-100 font-medium">💯 Баталгаатай</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📁</span>
          <h3 className="text-xl font-bold text-gray-800">Ангилал</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              to={`/products/${category.id}`}
              className="group bg-white rounded-2xl p-4 border-2 border-beige-200 hover:border-primary-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              onMouseEnter={() => {
                // Prefetch route on hover
                import('./ProductsPage');
              }}
            >
              <div className="aspect-square bg-gradient-to-br from-beige-50 to-beige-100 rounded-xl mb-3 overflow-hidden relative">
                {category.imageUrl ? (
                  <OptimizedImage
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full rounded-xl group-hover:scale-110 transition-transform duration-300"
                    aspectRatio="square"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-300">✨</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <p className="text-sm font-semibold text-center text-gray-700 group-hover:text-primary-600 transition-colors">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <h3 className="text-xl font-bold text-gray-800">Онцлох бүтээгдэхүүн</h3>
          </div>
          <Link to="/products">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 border-2 border-beige-300 text-primary-600 hover:bg-beige-50 hover:border-primary-400 rounded-xl transition-all duration-300"
            >
              Бүгдийг харах
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product: any) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discountedPrice={product.discountedPrice}
              image={product.images?.[0]}
              categoryId={product.category.id}
              stock={product.stock}
              LinkComponent={Link}
            />
          ))}
        </div>
        {products.length > 0 && (
          <div className="text-center mt-6">
            <Link to="/products">
              <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Бүх бүтээгдэхүүнийг харах
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* Cart Toast Notification */}
      {toastMessage && (
        <CartToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
});
