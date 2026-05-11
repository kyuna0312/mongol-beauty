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

const SKIN_TYPE_LABELS: Record<string, string> = {
  OILY: 'Тосолог', DRY: 'Хуурай', COMBINATION: 'Холимог', SENSITIVE: 'Мэдрэмтгий', NORMAL: 'Хэвийн',
};
const FEATURE_LABELS: Record<string, string> = {
  ANTI_AGING: 'Хөгширлийн эсрэг', HYDRATING: 'Чийгшүүлэх', BRIGHTENING: 'Цайруулах',
  ACNE_FIGHTING: 'Акнений эсрэг', SUNSCREEN: 'Наранд хамгаалах', ORGANIC: 'Органик',
};
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
    skinType: product.skinType,
    features: product.features,
  };
}

function isUuidLike(value?: string): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

export const ProductsPage = memo(function ProductsPage() {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') ?? '';
  const safeCategoryId = isUuidLike(categoryId) ? categoryId : null;
  const [showFilters, setShowFilters] = useState(false);
  const [filterSkinTypes, setFilterSkinTypes] = useState<string[]>([]);
  const [filterFeatures, setFilterFeatures] = useState<string[]>([]);
  const [filterPriceMax, setFilterPriceMax] = useState<string>('');
  const sortByParam = searchParams.get('sort') as SortOption | null;
  const sortBy: SortOption = sortByParam && ['default', 'price-asc', 'price-desc', 'name-asc'].includes(sortByParam)
    ? sortByParam
    : 'default';
  const viewModeParam = searchParams.get('view') as ViewMode | null;
  const viewMode: ViewMode = viewModeParam === 'list' ? 'list' : 'grid';

  const setSortBy = useCallback((val: SortOption) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'default') next.delete('sort');
      else next.set('sort', val);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const setViewMode = useCallback((val: ViewMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === 'grid') next.delete('view');
      else next.set('view', val);
      return next;
    }, { replace: true });
  }, [setSearchParams]);
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
    returnPartialData: false,
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
    const currentCount = productsData?.productsPaged?.items?.length || 0;
    const totalCount = productsData?.productsPaged?.totalCount ?? 0;
    if (currentCount >= totalCount) { setHasMore(false); return; }
    const result = await fetchMore({
      variables: {
        categoryId: safeCategoryId,
        limit: PAGE_SIZE,
        offset: currentCount,
        search: searchQuery || undefined,
      },
    });
    const incomingCount = result.data?.productsPaged?.items?.length || 0;
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

  const activeFilterCount = filterSkinTypes.length + filterFeatures.length + (filterPriceMax ? 1 : 0);

  const clearFilters = useCallback(() => {
    setFilterSkinTypes([]);
    setFilterFeatures([]);
    setFilterPriceMax('');
  }, []);

  // Memoize, map to UI view model, sort and filter products
  const products = useMemo(() => {
    const allProducts: ProductCardRaw[] = productsData?.productsPaged?.items || [];
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
        break;
    }

    const priceMaxNum = filterPriceMax ? Number(filterPriceMax) : null;

    return sorted.filter((p) => {
      if (filterSkinTypes.length > 0 && !filterSkinTypes.some((s) => p.skinType?.includes(s))) return false;
      if (filterFeatures.length > 0 && !filterFeatures.some((f) => p.features?.includes(f))) return false;
      if (priceMaxNum !== null && p.price > priceMaxNum) return false;
      return true;
    });
  }, [productsData, sortBy, filterSkinTypes, filterFeatures, filterPriceMax]);

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
              {(productsData?.productsPaged?.totalCount ?? 0) > 0 && (
                <p className="mt-1 text-sm text-stone-500">{productsData!.productsPaged!.totalCount} бүтээгдэхүүн</p>
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
              className="relative flex items-center gap-2 rounded-full border-beige-300 font-semibold text-primary-800 hover:bg-beige-50"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Шүүлт</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
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
      {hasMore && <div ref={sentinelRef} className="h-8" aria-hidden />}
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
                  {activeFilterCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white text-xs font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-primary-600 underline font-medium hover:text-primary-800"
                    >
                      Цэвэрлэх
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-10 h-10 rounded-full bg-white border-2 border-beige-300 flex items-center justify-center text-primary-600 hover:bg-beige-50 hover:scale-110 transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-8">
              {/* Price filter */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Дээд үнэ (₮)</h4>
                <input
                  type="number"
                  min="0"
                  placeholder="Жишээ: 50000"
                  value={filterPriceMax}
                  onChange={(e) => setFilterPriceMax(e.target.value)}
                  className="w-full border-2 border-beige-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>

              {/* Skin type filter */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Арьсны төрөл</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SKIN_TYPE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFilterSkinTypes((prev) =>
                          prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                        filterSkinTypes.includes(key)
                          ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                          : 'border-beige-200 bg-white text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feature filter */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Онцлог</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setFilterFeatures((prev) =>
                          prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-150 ${
                        filterFeatures.includes(key)
                          ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                          : 'border-beige-200 bg-white text-gray-700 hover:border-primary-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
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
