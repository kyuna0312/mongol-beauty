import { useState, memo, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { ProductCard, setCartToastCallback, ProductListSkeleton, CartToast } from '@mongol-beauty/ui';
import { Button } from '@mongol-beauty/ui';
import { Filter, Grid3x3, List, ArrowUpDown } from 'lucide-react';
import { PRODUCT_CARD_FRAGMENT } from '../graphql/fragments';
import { ErrorDisplay } from '../components/ErrorDisplay';

const GET_PRODUCTS = gql`
  query GetProducts($categoryId: ID) {
    products(categoryId: $categoryId) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

const GET_CATEGORY = gql`
  query GetCategory($id: ID!) {
    category(id: $id) {
      id
      name
    }
  }
`;

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc';
type ViewMode = 'grid' | 'list';

export const ProductsPage = memo(function ProductsPage() {
  const { categoryId } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCartToastCallback((message) => {
      setToastMessage(message);
    });
  }, []);

  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS, {
    variables: { categoryId: categoryId || null },
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const { data: categoryData } = useQuery(GET_CATEGORY, {
    variables: { id: categoryId },
    skip: !categoryId,
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  });

  // Memoize and sort products
  const products = useMemo(() => {
    const allProducts = productsData?.products || [];
    let sorted = [...allProducts];

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
      <div className="max-w-7xl mx-auto px-4 py-6">
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with Filter and Sort - Enhanced Design */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              {categoryData?.category?.name || 'Бүх бүтээгдэхүүн'}
            </h2>
            {products.length > 0 && (
              <span className="text-sm text-gray-500 ml-2">({products.length})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle - Desktop Only */}
            <div className="hidden md:flex items-center gap-1 bg-beige-50 rounded-xl p-1 border border-beige-200">
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
              className="flex items-center gap-2 border-2 border-beige-300 text-primary-600 hover:bg-beige-50 hover:border-primary-400 rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Шүүлт</span>
            </Button>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-sm text-gray-600 whitespace-nowrap flex items-center gap-1">
            <ArrowUpDown className="w-4 h-4" />
            Эрэмбэлэх:
          </span>
          <button
            onClick={() => setSortBy('default')}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
              sortBy === 'default'
                ? 'bg-primary-600 text-white'
                : 'bg-beige-50 text-gray-700 hover:bg-beige-100'
            }`}
          >
            Анхны
          </button>
          <button
            onClick={() => setSortBy('price-asc')}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
              sortBy === 'price-asc'
                ? 'bg-primary-600 text-white'
                : 'bg-beige-50 text-gray-700 hover:bg-beige-100'
            }`}
          >
            Үнэ: Багаас их рүү
          </button>
          <button
            onClick={() => setSortBy('price-desc')}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
              sortBy === 'price-desc'
                ? 'bg-primary-600 text-white'
                : 'bg-beige-50 text-gray-700 hover:bg-beige-100'
            }`}
          >
            Үнэ: Ихээс бага руу
          </button>
          <button
            onClick={() => setSortBy('name-asc')}
            className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap transition-all ${
              sortBy === 'name-asc'
                ? 'bg-primary-600 text-white'
                : 'bg-beige-50 text-gray-700 hover:bg-beige-100'
            }`}
          >
            Нэр: А-Я
          </button>
        </div>
      </div>

      {/* Products Grid/List */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Бүтээгдэхүүн олдсонгүй</p>
          <p className="text-gray-500 mb-6">Уучлаарай, одоогоор бүтээгдэхүүн байхгүй байна</p>
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
      )}

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
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
});
