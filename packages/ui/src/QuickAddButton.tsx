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
        className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center opacity-50 cursor-not-allowed"
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
      className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
        added
          ? 'bg-green-500 text-white shadow-lg'
          : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm'
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
