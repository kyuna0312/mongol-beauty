import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';

interface QuickAddButtonProps {
  productId: string;
  productName: string;
  price: number;
  stock: number;
  onAdd?: (message: string) => void;
  onQuickAdd?: (productId: string, price: number, stock: number) => Promise<boolean> | boolean;
}

export function QuickAddButton({
  productId,
  productName,
  price,
  stock,
  onAdd,
  onQuickAdd,
}: QuickAddButtonProps) {
  const [added, setAdded] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock === 0 || isAdding) return;
    
    setIsAdding(true);
    
    let didAdd = false;
    if (onQuickAdd) {
      const result = await onQuickAdd(productId, price, stock);
      didAdd = Boolean(result);
    }

    if (!didAdd) {
      setIsAdding(false);
      return;
    }

    setAdded(true);
    setIsAdding(false);
    onAdd?.(`${productName} сагсанд нэмэгдлээ!`);

    // Reset after 2 seconds
    setTimeout(() => setAdded(false), 2000);
  };

  if (stock === 0) {
    return (
      <button
        className="absolute bottom-2 right-2 flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-primary-200/90 bg-primary-50/90 text-primary-300 opacity-70"
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
