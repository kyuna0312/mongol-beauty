import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface CartToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export function CartToast({ message, onClose, duration = 3000 }: CartToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-primary-200 p-4 flex items-center gap-3 min-w-[300px] max-w-md">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-gray-800 flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Хаах"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
