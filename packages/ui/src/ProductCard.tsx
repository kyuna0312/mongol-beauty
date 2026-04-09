import { memo, useState } from 'react';
import { Card } from './Card';
import { OptimizedImage } from './OptimizedImage';
import { QuickAddButton } from './QuickAddButton';
import { Heart } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  image: string;
  categoryId: string;
  stock?: number;
  // Flexible routing - accepts a Link component from react-router-dom or any routing library
  LinkComponent?: React.ComponentType<any>;
  href?: string;
  onAdd?: (message: string) => void;
  onQuickAdd?: (productId: string, price: number, stock: number) => Promise<boolean> | boolean;
}

export const ProductCard = memo(function ProductCard({ 
  id, 
  name, 
  price,
  discountedPrice,
  image, 
  categoryId, 
  stock = 0,
  LinkComponent,
  href,
  onAdd,
  onQuickAdd,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const displayPrice = discountedPrice || price;
  const hasDiscount = Boolean(discountedPrice && discountedPrice < price);
  const discountPercent = hasDiscount ? Math.round(((price - (discountedPrice as number)) / price) * 100) : 0;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const productUrl = href || `/products/detail/${id}`;

  const cardContent = (
    <Card
      data-category-id={categoryId}
      className="overflow-hidden border border-primary-100/90 hover:border-primary-300/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col group rounded-2xl bg-white/95"
    >
      <div className="aspect-square bg-gradient-to-br from-primary-50/90 via-amber-50/40 to-beige-50/80 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10"></div>
        <OptimizedImage
          src={image || '/placeholder-product.jpg'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          aspectRatio="square"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="lazy"
        />
        
        {/* Stock Badge */}
        {stock === 0 && (
          <div className="absolute top-2 left-2 z-20 rounded-full border border-primary-200/90 bg-primary-50/95 px-2.5 py-1 text-xs font-semibold text-primary-700 backdrop-blur-sm">
            Нөөц дууссан
          </div>
        )}
        {stock > 0 && stock < 10 && (
          <div className="absolute top-2 left-2 z-20 rounded-full border border-amber-200/90 bg-amber-50/95 px-2.5 py-1 text-xs font-semibold text-amber-700 backdrop-blur-sm">
            Сүүлийн {stock} ширхэг
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 opacity-0 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Хүслийн жагсаалтад нэмэх"
        >
          <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-primary-600 text-primary-600' : 'text-gray-600'}`} />
        </button>

        {/* Quick Add Button */}
        {stock > 0 && (
          <div className="absolute bottom-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <QuickAddButton
              productId={id}
              productName={name}
              price={price}
              stock={stock}
              onAdd={onAdd}
              onQuickAdd={onQuickAdd}
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col bg-white p-4">
        <h3 className="mb-2 line-clamp-2 flex-1 text-sm font-semibold text-stone-800 transition-colors group-hover:text-primary-700">
          {name}
        </h3>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-xl font-bold ${hasDiscount ? 'text-emerald-600' : 'text-primary-600'}`}>
                {displayPrice.toLocaleString()}₮
              </p>
              {hasDiscount && (
                <p className="text-sm text-stone-400 line-through">
                  {price.toLocaleString()}₮
                </p>
              )}
            </div>
            {hasDiscount && (
              <p className="mt-0.5 text-xs font-medium text-emerald-600">{discountPercent}% хөнгөлөлттэй</p>
            )}
            {stock > 0 && !hasDiscount && (
              <p className="mt-0.5 text-xs text-stone-500">Нөөц: {stock}</p>
            )}
          </div>
          <span className="text-2xl opacity-0 transform transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            →
          </span>
        </div>
      </div>
    </Card>
  );

  if (LinkComponent) {
    return (
      <div className="relative">
        <LinkComponent
          to={productUrl}
          className="mb-focus-ring block rounded-2xl"
        >
          {cardContent}
        </LinkComponent>
      </div>
    );
  }

  return (
    <div className="relative">
      <a
        href={productUrl}
        className="mb-focus-ring block rounded-2xl"
      >
        {cardContent}
      </a>
    </div>
  );
});
