import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Button } from '@mongol-beauty/ui';
import { Upload } from 'lucide-react';
import { Toast } from '@/components/Toast';
import { useCart } from '@/hooks/useCart';
import { CREATE_ORDER_SIMPLE, UPLOAD_PAYMENT_RECEIPT_SIMPLE } from '@/graphql/orders';
import { CheckoutCartItem } from '@/interfaces/cart';
import { getCheckoutCreateOrderBlock, isValidCheckoutPhone } from '@/lib/checkout-validation';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cart, clear, mergeLocalCartToServer } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [createOrder] = useMutation(CREATE_ORDER_SIMPLE);
  const [uploadReceipt] = useMutation(UPLOAD_PAYMENT_RECEIPT_SIMPLE);
  const hasCartItems = cart.length > 0;
  const isPhoneValid = isValidCheckoutPhone(phone);

  useEffect(() => {
    mergeLocalCartToServer();
     
  }, []);

  const handleCreateOrder = async () => {
    const block = getCheckoutCreateOrderBlock(hasCartItems, phone);
    if (block === 'empty_cart') {
      setToastMessage('Сагс хоосон байна. Эхлээд бүтээгдэхүүн нэмнэ үү.');
      setShowToast(true);
      return;
    }
    if (block === 'invalid_phone') {
      setToastMessage('Утасны дугаар 8 оронтой байх шаардлагатай.');
      setShowToast(true);
      return;
    }

    try {
      const { data } = await createOrder({
        variables: {
          input: {
            items: (cart as CheckoutCartItem[]).map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            phone: phone || undefined,
            name: name || undefined,
          },
        },
      });

      setOrderId(data.createOrder.id);
      setToastMessage('Захиалга амжилттай үүслээ! Төлбөрийн баримт байршуулна уу.');
      setShowToast(true);
    } catch (_error) {
      setToastMessage('Алдаа гарлаа. Дахин оролдоно уу.');
      setShowToast(true);
    }
  };

  const handleUploadReceipt = async () => {
    if (!orderId || !receiptFile) return;

    try {
      await uploadReceipt({
        variables: {
          file: receiptFile,
          orderId,
        },
      });

      setToastMessage('Төлбөрийн баримт амжилттай байршууллаа!');
      setShowToast(true);
      await clear();
      setTimeout(() => {
        navigate(`/orders/${orderId}`);
      }, 2000);
    } catch (_error) {
      setToastMessage('Алдаа гарлаа. Дахин оролдоно уу.');
      setShowToast(true);
    }
  };

  const totalPrice = (cart as CheckoutCartItem[]).reduce((sum: number, item: CheckoutCartItem) => {
    return sum + (item.price || 0) * item.quantity;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Захиалга
        </h2>
      </div>

      {!orderId ? (
        <>
          {/* Customer Info - INCELLDERM Style */}
          <div className="bg-white rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>👤</span>
              Холбоо барих мэдээлэл
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Утасны дугаар</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="99112233"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэр</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Таны нэр"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Order Summary - INCELLDERM Style */}
          <div className="bg-gradient-to-br from-beige-50 to-beige-100 rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>📋</span>
              Захиалгын дүн
            </h3>
            <div className="space-y-3">
              {(cart as CheckoutCartItem[]).map((item) => (
                <div key={item.productId} className="flex justify-between text-sm bg-white/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <span className="text-gray-700">Бүтээгдэхүүн x{item.quantity}</span>
                  <span className="font-semibold text-primary-600">{(item.price * item.quantity).toLocaleString()}₮</span>
                </div>
              ))}
              <div className="border-t-2 border-beige-300 pt-4 mt-4 flex justify-between items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl">
                <span className="font-bold text-lg text-gray-800">Нийт:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {totalPrice.toLocaleString()}₮
                </span>
              </div>
            </div>
          </div>

          {/* Bank Info - Cute Design */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-100 shadow-sm">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
              <span>💳</span>
              Төлбөрийн мэдээлэл
            </h3>
            <p className="text-sm text-gray-700 mb-4 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl">
              Захиалга үүсгэсний дараа доорх данс руу төлбөрөө шилжүүлнэ үү. 💰
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="font-medium text-gray-600">Банк:</span>
                <span className="font-bold text-gray-800">ХХБ</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-blue-100">
                <span className="font-medium text-gray-600">Данс:</span>
                <span className="font-bold text-gray-800 font-mono">1234567890</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-600">Эзэмшлийн нэр:</span>
                <span className="font-bold text-gray-800">Mongol Beauty LLC</span>
              </div>
            </div>
          </div>

          {!isPhoneValid && (
            <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Утасны дугаар буруу байна. 8 оронтой тоо оруулна уу.
            </div>
          )}

          {/* Create Order Button - INCELLDERM Style */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-beige-200 p-4 shadow-2xl">
            <Button
              fullWidth
              size="lg"
              onClick={handleCreateOrder}
              disabled={!hasCartItems || !isPhoneValid}
              className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Захиалга үүсгэх ✨
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Upload Receipt - INCELLDERM Style */}
          <div className="bg-white rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
            <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
              <span>📸</span>
              Төлбөрийн баримт байршуулах
            </h3>
            <div className="space-y-4">
              <label className="block">
                <div className="border-2 border-dashed border-beige-300 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-beige-50 transition-all duration-300 bg-gradient-to-br from-beige-50/50 to-beige-100/50">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-primary-600" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {receiptFile ? receiptFile.name : 'Баримт сонгох'}
                  </p>
                  {!receiptFile && (
                    <p className="text-xs text-gray-500">PNG, JPG эсвэл PDF</p>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {receiptFile && (
                <Button
                  fullWidth
                  onClick={handleUploadReceipt}
                  className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  Баримт илгээх 📤
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
