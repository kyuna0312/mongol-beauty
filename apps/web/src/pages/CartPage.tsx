import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@mongol-beauty/ui';
import { Trash2, ShoppingBag, ArrowLeft, Truck, Shield } from 'lucide-react';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      price
      images
      stock
    }
  }
`;

interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const { data: productsData } = useQuery(GET_PRODUCTS);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  const products = productsData?.products || [];
  const cartWithProducts = cart.map((item) => ({
    ...item,
    product: products.find((p: any) => p.id === item.productId),
  }));

  const totalPrice = cartWithProducts.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const updateQuantity = (productId: string, newQuantity: number) => {
    const updated = cart.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ).filter((item) => item.quantity > 0);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // Dispatch event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId: string) => {
    const updated = cart.filter((item) => item.productId !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
    // Dispatch event to update cart count in header
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-beige-100 to-beige-200 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Сагс хоосон байна</h2>
          <p className="text-gray-500 mb-8 text-lg">Бүтээгдэхүүн нэмээд үзээрэй! ✨</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Бүтээгдэхүүн үзэх 🛍️
            </Button>
            <Link to="/">
              <Button
                variant="outline"
                className="border-2 border-beige-300 text-primary-600 hover:bg-beige-50 font-bold px-8 py-3 rounded-2xl"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Нүүр хуудас
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const itemCount = cartWithProducts.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🛒</span>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
              Сагс
            </h2>
            <p className="text-sm text-gray-500">{itemCount} ширхэг бүтээгдэхүүн</p>
          </div>
        </div>
        <Link to="/products">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex items-center gap-2 border-2 border-beige-300 text-primary-600 hover:bg-beige-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Үргэлжлүүлэх
          </Button>
        </Link>
      </div>

      <div className="space-y-4 mb-6">
        {cartWithProducts.map((item) => {
          if (!item.product) return null;
          return (
            <div
              key={item.productId}
              className="bg-white rounded-2xl p-4 border-2 border-beige-200 hover:border-primary-300 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-4">
                <div className="relative">
                  <img
                    src={item.product.images?.[0] || '/placeholder-product.jpg'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl border-2 border-beige-200"
                  />
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1 text-gray-800">{item.product.name}</h3>
                  <p className="text-primary-600 font-bold text-lg mb-3">
                    {item.product.price.toLocaleString()}₮
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-beige-50 to-beige-100 border-2 border-beige-300 flex items-center justify-center text-primary-600 font-bold hover:bg-beige-100 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-gray-800 bg-gray-50 rounded-xl py-2">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-beige-50 to-beige-100 border-2 border-beige-300 flex items-center justify-center text-primary-600 font-bold hover:bg-beige-100 hover:scale-110 active:scale-95 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto w-10 h-10 rounded-xl bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 hover:scale-110 active:scale-95 transition-all duration-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-xl p-3 text-center border border-beige-200">
          <Truck className="w-6 h-6 text-primary-600 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-700">Үнэгүй хүргэлт</p>
        </div>
        <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-xl p-3 text-center border border-beige-200">
          <Shield className="w-6 h-6 text-primary-600 mx-auto mb-1" />
          <p className="text-xs font-medium text-gray-700">Баталгаатай</p>
        </div>
        <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-xl p-3 text-center border border-beige-200">
          <span className="text-2xl mb-1 block">💳</span>
          <p className="text-xs font-medium text-gray-700">Банкны шилжүүлэг</p>
        </div>
      </div>

      {/* Fixed Bottom CTA - Enhanced */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-beige-200 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-beige-50 to-beige-100 rounded-2xl border-2 border-beige-200">
            <div>
              <span className="text-sm text-gray-600 block">Нийт дүн</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                {totalPrice.toLocaleString()}₮
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm text-gray-600 block">Бүтээгдэхүүн</span>
              <span className="text-lg font-bold text-primary-600">{itemCount} ширхэг</span>
            </div>
          </div>
          <Button
            fullWidth
            size="lg"
            onClick={() => navigate('/checkout')}
            className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Захиалах ✨
          </Button>
        </div>
      </div>
    </div>
  );
}
