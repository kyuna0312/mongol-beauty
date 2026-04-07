import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { memo, useMemo, useEffect, useState } from 'react';
import { ProductCard, setCartToastCallback, ProductListSkeleton, OptimizedImage, CartToast } from '@mongol-beauty/ui';
import { PRODUCT_CARD_FRAGMENT } from '@/graphql/fragments';
import { Button } from '@mongol-beauty/ui';
import { ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { ErrorDisplay } from '@/components/ErrorDisplay';

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
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_FEATURED_PRODUCTS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  useEffect(() => {
    setCartToastCallback((message: string) => {
      setToastMessage(message);
    });
  }, []);

  const categories = useMemo(() => categoriesData?.categories || [], [categoriesData]);
  const products = useMemo(() => productsData?.products || [], [productsData]);

  if (categoriesLoading || productsLoading) {
    return (
      <div className="mb-page">
        <div className="mb-10">
          <div className="h-5 bg-stone-200/80 rounded-lg w-40 mb-6 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-card-surface p-4 animate-pulse">
                <div className="aspect-square bg-stone-200/70 rounded-xl mb-3" />
                <div className="h-4 bg-stone-200/70 rounded" />
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
    <div className="mb-page">
      <section className="mb-10 md:mb-14">
        <div className="relative overflow-hidden rounded-3xl md:rounded-4xl mb-hero-gradient shadow-soft mb-noise ring-1 ring-white/60">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-amber-100/40 blur-3xl" aria-hidden />
          <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-rose-100/50 blur-2xl" aria-hidden />
          <div className="relative z-[1] grid gap-8 p-8 md:p-12 md:grid-cols-[1.1fr_minmax(0,1fr)] md:items-center">
            <div>
              <p className="mb-section-eyebrow text-primary-700/90">INCELLDERM · Mongolia</p>
              <h1 className="font-display text-3xl md:text-4xl lg:text-[2.65rem] font-semibold tracking-tight leading-[1.18] mb-4 text-stone-800">
                Гоо сайхны шинэлэг сонголт
              </h1>
              <p className="text-base md:text-lg text-stone-600 max-w-xl mb-6 leading-relaxed">
                Арчилгааны бүтээгдэхүүнийг найдвартай эх үүсвэрээс — таны өдөр тутмын routine-д зориулсан.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-white/70 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-sm">
                  <Truck className="h-4 w-4 text-primary-500" />
                  Хүргэлт үнэгүй
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/70 bg-white/70 px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 text-primary-500" />
                  Баталгаатай
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="mb-btn-primary">
                  Дэлгүүр үзэх
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/products"
                  className="mb-focus-ring inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-300/80 bg-white/50 px-6 py-3 text-sm font-semibold text-stone-700 hover:bg-white/90 transition-colors shadow-sm"
                >
                  Онцлох бүтээгдэхүүн
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="aspect-[4/3] rounded-2xl border border-white/70 bg-white/45 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <Sparkles className="h-16 w-16 text-primary-400" strokeWidth={1.25} />
              </div>
              <p className="mt-3 text-center text-sm text-stone-500">Шинэ коллекц удахгүй ✨</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10 md:mb-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="mb-section-eyebrow">Ангилал</p>
            <h2 className="mb-section-title">Өөрийнхөө хэрэгцээг сонгоно уу</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              to={`/products/${category.id}`}
              className="mb-focus-ring group mb-card-surface p-3 md:p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-200/90 hover:shadow-lg"
              onMouseEnter={() => {
                import('@/features/catalog/pages/ProductsPage');
              }}
            >
              <div className="relative mb-3 aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-amber-50/40 to-beige-50 ring-1 ring-rose-100/80">
                {category.imageUrl ? (
                  <OptimizedImage
                    src={category.imageUrl}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    aspectRatio="square"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary-300/80" strokeWidth={1.25} />
                  </div>
                )}
              </div>
              <p className="text-center text-sm font-semibold text-stone-800 group-hover:text-primary-800 transition-colors">
                {category.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-section-eyebrow">Онцлох</p>
            <h2 className="mb-section-title">Танд санал болгож буй бүтээгдэхүүн</h2>
          </div>
          <Link to="/products" className="hidden sm:block">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-rose-200/90 text-primary-700 hover:bg-rose-50/80 font-semibold"
            >
              Бүгдийг харах
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
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
          <div className="mt-8 flex justify-center sm:hidden">
            <Link to="/products" className="mb-btn-primary w-full max-w-xs">
              Бүх бүтээгдэхүүн
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {toastMessage && (
        <CartToast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
});
