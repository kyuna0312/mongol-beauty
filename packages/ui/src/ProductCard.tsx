import { memo, useState, ReactNode } from 'react';
import { Card } from './Card';
import { OptimizedImage } from './OptimizedImage';
import { QuickAddButton } from './QuickAddButton';
import { Heart } from 'lucide-react';

// Global toast state management
let toastCallback: ((message: string) => void) | null = null;

export function setCartToastCallback(callback: (message: string) => void) {
  toastCallback = callback;
}

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
  href
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const displayPrice = discountedPrice || price;
  const hasDiscount = discountedPrice && discountedPrice < price;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // TODO: Implement wishlist functionality
  };

  const productUrl = href || `/products/${categoryId}/${id}`;

  const cardContent = (
    <Card className="overflow-hidden border border-rose-100/90 hover:border-primary-300/80 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col group rounded-2xl bg-white/95">
      <div className="aspect-square bg-gradient-to-br from-rose-50/90 via-amber-50/40 to-beige-50/80 relative overflow-hidden">
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
          <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            Нөөц дууссан
          </div>
        )}
        {stock > 0 && stock < 10 && (
          <div className="absolute top-2 left-2 z-20 bg-gold-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            Сүүлийн {stock} ширхэг
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
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
              onAdd={(message) => toastCallback?.(message)}
            />
          </div>
        )}
      </div>
      <div className="p-4 bg-white flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-800 group-hover:text-primary-600 transition-colors flex-1">
          {name}
        </h3>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-xl ${hasDiscount ? 'text-emerald-600' : 'text-primary-600'}`}>
                        {displayPrice.toLocaleString()}₮
                      </p>
                      {hasDiscount && (
                        <p className="text-sm text-gray-400 line-through">
                          {price.toLocaleString()}₮
                        </p>
                      )}
                    </div>
                    {hasDiscount && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">10% хөнгөлөлттэй</p>
                    )}
                    {stock > 0 && !hasDiscount && (
                      <p className="text-xs text-gray-500 mt-0.5">Нөөц: {stock}</p>
                    )}
                  </div>
          <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Card>
  );

  if (LinkComponent) {
    return (
      <div className="relative">
        <LinkComponent to={productUrl} className="block">
          {cardContent}
        </LinkComponent>
      </div>
    );
  }

  return (
    <div className="relative">
      <a href={productUrl} className="block">
        {cardContent}
      </a>
    </div>
  );
});
