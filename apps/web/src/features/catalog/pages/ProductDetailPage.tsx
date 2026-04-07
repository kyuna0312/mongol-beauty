import { useState } from 'react';
import { useParams, Link, Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button, ProductCard, CartToast } from '@mongol-beauty/ui';
import { ShoppingCart, Share2, Heart, Check } from 'lucide-react';
import { PRODUCT_CARD_FRAGMENT } from '@/graphql/fragments';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!, $categoryId: ID) {
    product(id: $id, categoryId: $categoryId) {
      id
      name
      price
      discountedPrice
      stock
      description
      images
      skinType
      features
      category {
        id
        name
      }
    }
  }
`;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidLike(value?: string): boolean {
  return Boolean(value && UUID_PATTERN.test(value));
}

const GET_RELATED_PRODUCTS = gql`
  query GetRelatedProducts($categoryId: ID!, $excludeId: ID!) {
    products(categoryId: $categoryId) {
      ...ProductCardFragment
    }
  }
  ${PRODUCT_CARD_FRAGMENT}
`;

export function ProductDetailPage() {
  const { productId: rawProductId, categoryId: rawCategoryId } = useParams();
  const location = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { setItem, items } = useCart();
  const { isAuthenticated } = useAuth();

  // Defensive param handling: old/shared links can swap id order.
  const effectiveProductId =
    isUuidLike(rawProductId) ? rawProductId : isUuidLike(rawCategoryId) ? rawCategoryId : rawProductId;
  const effectiveCategoryRef =
    effectiveProductId === rawProductId ? rawCategoryId : rawProductId;

  const { data, loading, error } = useQuery(GET_PRODUCT, {
    variables: {
      id: effectiveProductId,
      categoryId: effectiveCategoryRef || null,
    },
    skip: !effectiveProductId,
    onError: (queryError) => {
      console.error('ProductDetail query failed', {
        rawCategoryId,
        rawProductId,
        effectiveCategoryRef,
        effectiveProductId,
        errors: queryError.message,
      });
    },
  });

  const { data: relatedData } = useQuery(GET_RELATED_PRODUCTS, {
    variables: { 
      categoryId: data?.product?.category?.id || rawCategoryId,
      excludeId: effectiveProductId 
    },
    skip: !data?.product?.category?.id && !rawCategoryId,
  });

  const product = data?.product;
  const relatedProducts =
    relatedData?.products?.filter((p: any) => p.id !== effectiveProductId).slice(0, 4) || [];

  const addToCart = async () => {
    if (product.stock === 0) return;
    const current = (items.find((item: any) => item.productId === effectiveProductId)?.quantity ?? 0) as number;
    const nextQuantity = current + quantity;
    if (nextQuantity > product.stock) {
      setToastMessage('Нөөц хүрэлцэхгүй байна');
      return;
    }

    await setItem(effectiveProductId as string, nextQuantity, product.price);
    
    setAddedToCart(true);
    setToastMessage(
      isAuthenticated
        ? `${product.name} сагсанд нэмэгдлээ (базад хадгалагдлаа)!`
        : `${product.name} сагсанд нэмэгдлээ!`,
    );
    
    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Холбоос хуулагдлаа!');
    }
  };

  if (loading) {
    return <div className="p-4">Уншиж байна...</div>;
  }

  if (error) {
    return <div className="p-4">Бүтээгдэхүүн ачаалахад алдаа гарлаа</div>;
  }

  if (!effectiveProductId) {
    return <div className="p-4">Буруу бүтээгдэхүүний холбоос байна</div>;
  }

  if (!product) {
    console.warn('Product not found for URL params', {
      rawCategoryId,
      rawProductId,
      effectiveCategoryRef,
      effectiveProductId,
    });
    return <div className="p-4">Бүтээгдэхүүн олдсонгүй</div>;
  }

  const canonicalPath = `/products/${product.category.id}/${product.id}`;
  if (location.pathname !== canonicalPath) {
    return <Navigate to={`${canonicalPath}${location.search}`} replace />;
  }

  return (
    <div className="max-w-6xl mx-auto px-0 sm:px-4 pb-28 sm:pb-32 md:pb-10">
      <div className="mb-card-surface overflow-hidden rounded-b-3xl sm:rounded-3xl border-0 sm:border shadow-none sm:shadow-soft">
        <div className="aspect-square bg-gradient-to-br from-beige-50 via-beige-100 to-beige-50 relative overflow-hidden">
          <img
            src={product.images?.[selectedImage] || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-3 p-4 overflow-x-auto bg-white">
            {product.images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl border-2 transition-all duration-300 transform ${
                  selectedImage === idx
                    ? 'border-primary-500 scale-110 shadow-lg ring-2 ring-gold-200'
                    : 'border-gray-200 hover:border-primary-300 hover:scale-105'
                }`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover rounded-lg" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-t-3xl -mt-5 relative z-10 p-6 sm:p-8 mb-6 border-x border-b border-beige-200/80 sm:mx-0 sm:rounded-3xl sm:border sm:shadow-soft sm:-mt-0 sm:mb-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Link
                to={`/products/${product.category.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {product.category.name}
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-500">{product.name}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'bg-primary-100 text-primary-600'
                  : 'bg-beige-50 text-gray-600 hover:bg-beige-100'
              }`}
              aria-label="Хүслийн жагсаалтад нэмэх"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="w-10 h-10 rounded-xl bg-beige-50 text-gray-600 hover:bg-beige-100 flex items-center justify-center transition-all"
              aria-label="Хуваалцах"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex items-baseline gap-2 mb-6">
          <div className="flex items-baseline gap-3">
            <p className={`text-4xl font-bold ${product.discountedPrice ? 'text-green-600' : 'bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent'}`}>
              {(product.discountedPrice || product.price).toLocaleString()}₮
            </p>
            {product.discountedPrice && (
              <p className="text-xl text-gray-400 line-through">
                {product.price.toLocaleString()}₮
              </p>
            )}
          </div>
          <span className="text-sm text-gray-500">/ ширхэг</span>
          {product.discountedPrice && (
            <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              10% хөнгөлөлт
            </span>
          )}
        </div>

        {product.description && (
          <div className="mb-6 p-4 bg-gradient-to-br from-beige-50 to-beige-100 rounded-2xl border border-beige-200">
            <h3 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
              <span>📝</span>
              Тайлбар
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.skinType?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <span>💆</span>
              Арьсны төрөл
            </h3>
            <div className="flex flex-wrap gap-2">
              {product.skinType.map((type: string) => (
                <span
                  key={type}
                  className="px-4 py-2 bg-gradient-to-r from-beige-100 to-beige-200 border border-beige-300 rounded-full text-sm font-medium text-primary-700 shadow-sm hover:shadow-md transition-shadow"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quantity Selector - INCELLDERM Style */}
        <div className="mb-6 p-4 bg-gradient-to-br from-beige-50 to-gold-50 rounded-2xl border border-beige-200">
          <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
            <span>🔢</span>
            Тоо ширхэг
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 rounded-xl bg-white border-2 border-beige-300 flex items-center justify-center text-primary-600 font-bold text-xl hover:bg-beige-50 hover:border-primary-400 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              −
            </button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-gray-800 bg-white px-6 py-2 rounded-xl border-2 border-beige-300 inline-block min-w-[60px]">
                {quantity}
              </span>
            </div>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-12 h-12 rounded-xl bg-white border-2 border-beige-300 flex items-center justify-center text-primary-600 font-bold text-xl hover:bg-beige-50 hover:border-primary-400 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              +
            </button>
            <div className="ml-auto text-right">
              <span className="text-gray-600 text-sm block">Нөөц</span>
              <span className="text-primary-600 font-bold text-lg">{product.stock}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-12 mb-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🛍️</span>
            <h3 className="text-xl font-bold text-gray-800">Холбоотой бүтээгдэхүүн</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct: any) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                name={relatedProduct.name}
                price={relatedProduct.price}
                discountedPrice={relatedProduct.discountedPrice}
                image={relatedProduct.images?.[0]}
                categoryId={relatedProduct.category.id}
                stock={relatedProduct.stock}
                LinkComponent={Link}
              />
            ))}
          </div>
        </section>
      )}

      <div className="fixed left-0 right-0 z-[60] border-t border-beige-200/90 bg-white/95 backdrop-blur-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-nav bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-0 md:rounded-t-2xl md:mx-auto md:max-w-6xl md:left-4 md:right-4 md:bottom-4 md:border md:border-beige-200/80">
        <Button
          fullWidth
          size="lg"
          onClick={addToCart}
          disabled={product.stock === 0}
          className={`flex items-center justify-center gap-2 font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-300 ${
            addedToCart
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white hover:scale-105 active:scale-95'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {addedToCart ? (
            <>
              <Check className="w-6 h-6" />
              <span>Нэмэгдлээ!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-6 h-6" />
              <span>Сагсанд нэмэх</span>
              <span className="ml-1">🛒</span>
            </>
          )}
        </Button>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <CartToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
