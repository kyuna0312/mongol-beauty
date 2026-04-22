import { useState, memo, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ProductCard, ProductListSkeleton, CartToast } from '@mongol-beauty/ui';
import { Button } from '@mongol-beauty/ui';
import { Filter, Grid3x3, List, ArrowUpDown } from 'lucide-react';
import { GET_CATEGORY_BASIC, GET_PRODUCTS_PAGED } from '@/graphql/catalog';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { PageHead } from '@/features/content/components/PageHead';
import { useCart } from '@/hooks/useCart';
import { clearCartToast, useCartToast } from '@/features/cart/store';
import { CartItemLike } from '@/interfaces/cart';
import { ProductCardRaw, ProductCardView } from '@/interfaces/catalog';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type ViewMode = 'grid' | 'list';
const PAGE_SIZE = 24;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toProductCardView(product: ProductCardRaw): ProductCardView {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    discountedPrice: product.discountedPrice,
    image: product.images?.[0] || '/placeholder-product.jpg',
    categoryId: product.category.id,
    stock: product.stock ?? 0,
  };
}

function isUuidLike(value?: string): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

export const ProductsPage = memo(function ProductsPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const safeCategoryId = isUuidLike(categoryId) ? categoryId : null;
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { items: cartItems, setItem } = useCart();
  const { message: toastMessage, showCartToast } = useCartToast();

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    fetchMore,
    networkStatus,
  } = useQuery(GET_PRODUCTS_PAGED, {
    variables: { categoryId: safeCategoryId, limit: PAGE_SIZE, offset: 0, search: searchQuery || undefined },
    fetchPolicy: 'cache-and-network',
    nextFetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all',
  });
  const isFetchingMore = networkStatus === 3;

  const { data: categoryData } = useQuery(GET_CATEGORY_BASIC, {
    variables: { id: safeCategoryId },
    skip: !safeCategoryId,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  useEffect(() => {
    setHasMore(true);
  }, [safeCategoryId, searchQuery]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || productsLoading || isFetchingMore) return;
    const currentCount = productsData?.products?.length || 0;
    const result = await fetchMore({
      variables: {
        categoryId: safeCategoryId,
        limit: PAGE_SIZE,
        offset: currentCount,
        search: searchQuery || undefined,
      },
    });
    const incomingCount = result.data?.products?.length || 0;
    if (incomingCount < PAGE_SIZE) {
      setHasMore(false);
    }
  }, [hasMore, productsLoading, isFetchingMore, productsData, fetchMore, safeCategoryId]);

  const handleQuickAdd = useCallback(
    async (productId: string, price: number, stock: number) => {
      const current =
        (cartItems.find((item: CartItemLike) => item.productId === productId)?.quantity ?? 0) as number;
      if (current >= stock) {
        showCartToast('Нөөц хүрэлцэхгүй байна');
        return false;
      }
      await setItem(productId, current + 1, price);
      return true;
    },
    [cartItems, setItem],
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreProducts();
        }
      },
      { rootMargin: '250px 0px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMoreProducts, hasMore]);

  // Memoize, map to UI view model and sort products
  const products = useMemo(() => {
    const allProducts: ProductCardRaw[] = productsData?.products || [];
    const mapped = allProducts.map(toProductCardView);
    const sorted = [...mapped];

    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Keep original order
        break;
    }

    return sorted;
  }, [productsData, sortBy]);

  if (productsLoading && !productsData) {
    return (
      <div className="mb-page">
        <ProductListSkeleton />
      </div>
    );
  }

  if (productsError) {
    return (
      <ErrorDisplay
        title="Бүтээгдэхүүн ачаалахад алдаа гарлаа"
        message="Бүтээгдэхүүний мэдээллийг ачаалахад алдаа гарсан байна. Дахин оролдоно уу."
        showRem={true}
        showRam={false}
      />
    );
  }

  return (
    <div className="mb-page">
      <PageHead
        pageTitle={categoryData?.category?.name || 'Бүх бүтээгдэхүүн'}
        metaTitle={categoryData?.category?.name ? `${categoryData.category.name} | Бүтээгдэхүүн` : 'Бүх бүтээгдэхүүн'}
        metaDescription="Арьс арчилгаа, гоо сайхны бүтээгдэхүүнийг ангиллаар үзэж, үнийн дагуу эрэмбэлэн хайна."
        contentMarkdown=""
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        ogType="website"
      />
      <div className="mb-6 md:mb-8">
        <div className="mb-card-surface p-4 md:p-6 mb-5">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="mb-section-eyebrow">Дэлгүүр</p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900">
                {searchQuery
                  ? `"${searchQuery}" хайлтын үр дүн`
                  : categoryData?.category?.name || 'Бүх бүтээгдэхүүн'}
              </h1>
              {products.length > 0 && (
                <p className="mt-1 text-sm text-stone-500">{products.length} бүтээгдэхүүн</p>
              )}
            </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden md:flex items-center gap-1 rounded-xl border border-beige-200/90 bg-beige-50/80 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-beige-100'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-beige-100'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 rounded-full border-beige-300 font-semibold text-primary-800 hover:bg-beige-50"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Шүүлт</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <span className="text-sm text-stone-600 whitespace-nowrap flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-stone-400" />
            Эрэмбэлэх
          </span>
          <button
            type="button"
            onClick={() => setSortBy('default')}
            className={`mb-chip shrink-0 ${
              sortBy === 'default'
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-beige-200 bg-white text-stone-700 hover:border-beige-300'
            }`}
          >
            Анхны
          </button>
          <button
            type="button"
            onClick={() => setSortBy('price-asc')}
            className={`mb-chip shrink-0 ${
              sortBy === 'price-asc'
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-beige-200 bg-white text-stone-700 hover:border-beige-300'
            }`}
          >
            Үнэ ↑
          </button>
          <button
            type="button"
            onClick={() => setSortBy('price-desc')}
            className={`mb-chip shrink-0 ${
              sortBy === 'price-desc'
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-beige-200 bg-white text-stone-700 hover:border-beige-300'
            }`}
          >
            Үнэ ↓
          </button>
          <button
            type="button"
            onClick={() => setSortBy('name-asc')}
            className={`mb-chip shrink-0 ${
              sortBy === 'name-asc'
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-beige-200 bg-white text-stone-700 hover:border-beige-300'
            }`}
          >
            Нэр А–Я
          </button>
        </div>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Бүтээгдэхүүн олдсонгүй</p>
          <p className="text-gray-500 mb-6">
            {searchQuery
              ? `"${searchQuery}" хайлтад тохирох бүтээгдэхүүн олдсонгүй`
              : 'Уучлаарай, одоогоор бүтээгдэхүүн байхгүй байна'}
          </p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white">
              Нүүр хуудас руу буцах
            </Button>
          </Link>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
          : 'space-y-4'
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discountedPrice={product.discountedPrice}
              image={product.image}
              categoryId={product.categoryId}
              stock={product.stock}
              LinkComponent={Link}
              onAdd={showCartToast}
              onQuickAdd={handleQuickAdd}
            />
          ))}
        </div>
      )}
      {products.length >= PAGE_SIZE && <div ref={sentinelRef} className="h-8" aria-hidden />}
      <div className="py-4 text-center text-sm text-stone-500">
        {networkStatus === 3
          ? 'Илүү бүтээгдэхүүн ачаалж байна...'
          : !hasMore && products.length > 0
            ? 'Бүх бүтээгдэхүүнийг харууллаа'
            : ''}
      </div>

      {/* Bottom Sheet Filter - Cute Design */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in" onClick={() => setShowFilters(false)}>
          <div className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b-2 border-beige-200 bg-gradient-to-r from-beige-50 to-beige-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <h3 className="text-xl font-bold text-gray-800">Шүүлт</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-10 h-10 rounded-full bg-white border-2 border-beige-300 flex items-center justify-center text-primary-600 hover:bg-beige-50 hover:scale-110 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">🎨</span>
                <p className="text-gray-600">Шүүлтийн сонголтууд энд байна</p>
                <p className="text-sm text-gray-400 mt-2">Удахгүй нэмэгдэх болно</p>
              </div>
            </div>
            <div className="p-6 border-t-2 border-beige-200 bg-white sticky bottom-0">
              <Button
                fullWidth
                onClick={() => setShowFilters(false)}
                className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Хэрэглэх ✨
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Toast Notification */}
      {toastMessage && (
        <CartToast
          message={toastMessage}
          onClose={clearCartToast}
        />
      )}
    </div>
  );
});
