import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

interface QuickAddButtonProps {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  onAdd?: (message: string) => void;
}

export function QuickAddButton({ productId, productName, price, stock, onAdd }: QuickAddButtonProps) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock === 0 || isAdding) return;
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }

    setIsAdding(true);
    
    // Add to cart
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.productId === productId);

    if (existingItem) {
      if (existingItem.quantity < stock) {
        existingItem.quantity += 1;
      } else {
        setIsAdding(false);
        return; // Stock limit reached
      }
    } else {
      cart.push({ productId, quantity: 1, price });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    setAdded(true);
    setIsAdding(false);
    onAdd?.(`${productName} сагсанд нэмэгдлээ!`);

    // Reset after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  if (stock === 0) {
    return (
      <button
        className="absolute bottom-2 right-2 flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-rose-200/90 bg-rose-50/90 text-rose-300 opacity-70"
        disabled
        aria-label="Нөөц дууссан"
      >
        <ShoppingCart className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={handleQuickAdd}
      className={`absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        added
          ? 'bg-emerald-500 text-white shadow-md'
          : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md'
      }`}
      aria-label="Сагсанд нэмэх"
    >
      {added ? (
        <Check className="w-5 h-5" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
    </button>
  );
}
