import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { Button } from '@mongol-beauty/ui';
import { Upload, Tag } from 'lucide-react';
import { Toast } from '@/components/Toast';
import { useCart } from '@/hooks/useCart';
import { CREATE_ORDER_SIMPLE, UPLOAD_PAYMENT_RECEIPT_SIMPLE } from '@/graphql/orders';
import { GET_SITE_SETTINGS, VALIDATE_VOUCHER, GET_ME } from '@/graphql/queries';
import { CheckoutCartItem } from '@/interfaces/cart';
import { getCheckoutCreateOrderBlock, isValidCheckoutPhone } from '@/lib/checkout-validation';
import type { PaymentMethod } from '@/graphql/generated/graphql';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cart, clear, mergeLocalCartToServer } = useCart();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherDiscount, setVoucherDiscount] = useState<number | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createOrder] = useMutation(CREATE_ORDER_SIMPLE);
  const [uploadReceipt] = useMutation(UPLOAD_PAYMENT_RECEIPT_SIMPLE);
  const { data: settingsData } = useQuery(GET_SITE_SETTINGS);
  const { data: meData } = useQuery(GET_ME);
  const [validateVoucher, { loading: voucherLoading }] = useLazyQuery(VALIDATE_VOUCHER);
  const settings = settingsData?.siteSettings;
  const isVip = meData?.me?.userType === 'VIP_USER';
  const hasCartItems = cart.length > 0;
  const isPhoneValid = isValidCheckoutPhone(phone);
  const maxReceiptBytes = 5 * 1024 * 1024;
  const allowedReceiptMime = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ]);

  useEffect(() => {
    mergeLocalCartToServer();
     
  }, []);

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message?: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }
    if (
      typeof error === 'object' &&
      error !== null &&
      'graphQLErrors' in error &&
      Array.isArray((error as { graphQLErrors?: unknown[] }).graphQLErrors) &&
      (error as { graphQLErrors: Array<{ message?: string }> }).graphQLErrors[0]?.message
    ) {
      return (error as { graphQLErrors: Array<{ message?: string }> }).graphQLErrors[0].message || fallback;
    }
    return fallback;
  };

  const handleVoucherApply = async () => {
    setVoucherError('');
    setVoucherDiscount(null);
    if (!voucherCode.trim()) return;
    try {
      const { data, error } = await validateVoucher({ variables: { code: voucherCode.trim() } });
      if (error || !data?.validateVoucher) {
        setVoucherError('Voucher хүчингүй байна');
      } else {
        setVoucherDiscount(data.validateVoucher.discountPercent);
      }
    } catch {
      setVoucherError('Voucher олдсонгүй эсвэл хүчингүй байна');
    }
  };

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
    if (paymentMethod === 'BANK_TRANSFER') {
      if (!receiptFile) {
        setToastMessage('Гүйлгээний баримтын зураг заавал оруулна уу.');
        setShowToast(true);
        return;
      }
      if (!allowedReceiptMime.has(receiptFile.type)) {
        setToastMessage('Файлын төрөл буруу байна. JPG, PNG, WEBP, GIF, HEIC зураг оруулна уу.');
        setShowToast(true);
        return;
      }
      if (receiptFile.size > maxReceiptBytes) {
        setToastMessage('Баримтын файл хэт том байна. 5MB-аас бага зураг сонгоно уу.');
        setShowToast(true);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const { data } = await createOrder({
        variables: {
          input: {
            items: (cart as CheckoutCartItem[]).map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
            phone: phone || undefined,
            name: name || undefined,
            deliveryAddress: deliveryAddress || undefined,
            deliveryNote: deliveryNote || undefined,
            notes: notes.length > 0 ? notes : undefined,
            paymentMethod,
            voucherCode: voucherDiscount !== null ? voucherCode.trim() : undefined,
          },
        },
      });

      const createdOrderId = data?.createOrder?.id as string | undefined;
      if (!createdOrderId) {
        throw new Error('Захиалга үүсгэж чадсангүй. Дахин оролдоно уу.');
      }

      if (paymentMethod === 'BANK_TRANSFER' && receiptFile) {
        try {
          await uploadReceipt({
            variables: {
              file: receiptFile,
              orderId: createdOrderId,
            },
          });
        } catch (uploadError) {
          setToastMessage(
            getErrorMessage(
              uploadError,
              `Захиалга үүслээ (#${createdOrderId.slice(0, 8)}), гэхдээ баримт илгээхэд алдаа гарлаа.`,
            ),
          );
          setShowToast(true);
          return;
        }
      }

      await clear();
      const successMsg =
        paymentMethod === 'CASH'
          ? 'Захиалга амжилттай үүслээ. Хүргэлтийн үед бэлэн мөнгөөр төлнө үү.'
          : 'Захиалга амжилттай үүсэж, төлбөрийн баримт илгээгдлээ. Админ шалгасны дараа төлөв "Төлбөр баталгаажсан" болно.';
      setToastMessage(successMsg);
      setShowToast(true);
      setTimeout(() => {
        navigate(`/orders/${createdOrderId}`);
      }, 1500);
    } catch (error) {
      setToastMessage(getErrorMessage(error, 'Алдаа гарлаа. Дахин оролдоно уу.'));
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseTotal = (cart as CheckoutCartItem[]).reduce((sum: number, item: CheckoutCartItem) => {
    return sum + (item.price || 0) * item.quantity;
  }, 0);
  const vipDiscount = isVip ? 0.2 : 0;
  const voucherDiscountRate = voucherDiscount ? voucherDiscount / 100 : 0;
  const effectiveDiscount = Math.max(vipDiscount, voucherDiscountRate);
  const discountedSubtotal = Math.round(baseTotal * (1 - effectiveDiscount));
  const feeThreshold = settings?.freeDeliveryThreshold ?? 200000;
  const feeAmount = settings?.deliveryFee ?? 5000;
  const deliveryFee = discountedSubtotal >= feeThreshold ? 0 : feeAmount;
  const totalPrice = discountedSubtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-32">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-3xl">📝</span>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
          Захиалга
        </h2>
      </div>

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хүргэлтийн хаяг
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Дүүрэг, хороо, байр, тоот..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Хүргэлтийн тэмдэглэл
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Байрны тоот, орц, давхар, утасны дугаар..."
                  rows={3}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Нэмэлт тэмдэглэл</label>
                <div className="space-y-2">
                  {(['байнга хүн байна', 'ирэхээсээ өмнө яриа', 'нялх хүүхэдтэй', 'зөвхөн оройн цагаар'] as const).map((tag) => (
                    <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={notes.includes(tag)}
                        onChange={() => setNotes((prev) => prev.includes(tag) ? prev.filter((n) => n !== tag) : [...prev, tag])}
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Voucher / VIP */}
        <div className="bg-white rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Tag size={16} />
            Хөнгөлөлт
          </h3>
          {isVip && (
            <div className="mb-3 rounded-xl bg-purple-50 border border-purple-200 px-4 py-2 text-sm text-purple-800 font-medium">
              VIP хэрэглэгч — 20% хөнгөлөлт автоматаар нэмэгдсэн
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Voucher код оруулах"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
            />
            <button
              type="button"
              onClick={handleVoucherApply}
              disabled={voucherLoading}
              className="px-4 py-3 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-60 transition-colors"
            >
              {voucherLoading ? '...' : 'Хэрэглэх'}
            </button>
          </div>
          {voucherDiscount !== null && (
            <p className="mt-2 text-sm text-green-700 font-medium">Voucher хэрэглэгдлээ: {voucherDiscount}% хөнгөлөлт</p>
          )}
          {voucherError && (
            <p className="mt-2 text-sm text-red-600">{voucherError}</p>
          )}
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
              {effectiveDiscount > 0 && (
                <div className="flex justify-between text-sm bg-green-50 px-4 py-2 rounded-xl text-green-700">
                  <span>Хөнгөлөлт ({Math.round(effectiveDiscount * 100)}%):</span>
                  <span className="font-semibold">-{(baseTotal - discountedSubtotal).toLocaleString()}₮</span>
                </div>
              )}
              <div className="flex justify-between text-sm bg-white/60 px-4 py-2 rounded-xl">
                <span className="text-gray-600">Хүргэлтийн төлбөр:</span>
                {deliveryFee === 0 ? (
                  <span className="font-semibold text-green-700">Үнэгүй</span>
                ) : (
                  <span className="font-semibold text-gray-800">{deliveryFee.toLocaleString()}₮</span>
                )}
              </div>
              {deliveryFee > 0 && (
                <p className="text-xs text-gray-500 px-4">
                  {feeThreshold.toLocaleString()}₮-с дээш захиалгад хүргэлт үнэгүй
                </p>
              )}
              <div className="border-t-2 border-beige-300 pt-4 mt-4 flex justify-between items-center bg-white/80 backdrop-blur-sm px-4 py-3 rounded-xl">
                <span className="font-bold text-lg text-gray-800">Нийт:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                  {totalPrice.toLocaleString()}₮
                </span>
              </div>
            </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white rounded-2xl p-6 mb-4 border-2 border-beige-200 shadow-sm">
          <h3 className="font-bold mb-4 text-gray-800 flex items-center gap-2">
            <span>💳</span>
            Төлбөрийн арга
          </h3>
          <div className="flex gap-3">
            {(['BANK_TRANSFER', 'CASH'] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                  paymentMethod === method
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {method === 'BANK_TRANSFER' ? '🏦 Банкны шилжүүлэг' : '💵 Бэлэн мөнгө'}
              </button>
            ))}
          </div>
          {paymentMethod === 'CASH' && (
            <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
              Хүргэлтийн үед бэлэн мөнгөөр төлнө үү.
            </p>
          )}
        </div>

        {/* Bank Info - shown only for BANK_TRANSFER */}
        {paymentMethod === 'BANK_TRANSFER' && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border-2 border-blue-100 shadow-sm">
            <h3 className="font-bold mb-3 text-gray-800 flex items-center gap-2">
              <span>🏦</span>
              Төлбөрийн мэдээлэл
            </h3>
            <p className="text-sm text-gray-700 mb-4 bg-white/60 backdrop-blur-sm px-4 py-3 rounded-xl">
              Доорх данс руу төлбөрөө шилжүүлээд баримтын зургаа оруулна уу. Админ шалгаад төлбөрийн төлөвийг баталгаажуулна. 💰
            </p>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center gap-2 py-2 border-b border-blue-100">
                <span className="font-medium text-gray-600 shrink-0">Банк:</span>
                <span className="font-bold text-gray-800 text-right">{settings?.bankName ?? 'ХХБ'}</span>
              </div>
              <div className="flex justify-between items-center gap-2 py-2 border-b border-blue-100">
                <span className="font-medium text-gray-600 shrink-0">Данс:</span>
                <span className="font-bold text-gray-800 font-mono text-right break-all">{settings?.bankAccount ?? '1234567890'}</span>
              </div>
              <div className="flex justify-between items-center gap-2 py-2">
                <span className="font-medium text-gray-600 shrink-0">Эзэмшлийн нэр:</span>
                <span className="font-bold text-gray-800 text-right break-all">{settings?.bankOwner ?? 'Mongol Beauty LLC'}</span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border-2 border-dashed border-blue-300 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-gray-800">Гүйлгээний баримтын зураг оруулах (заавал)</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700">
                <Upload className="h-4 w-4" />
                Зураг сонгох
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              <p className="mt-2 text-sm text-gray-700">
                {receiptFile ? `Сонгосон файл: ${receiptFile.name}` : 'Одоогоор файл сонгоогүй байна'}
              </p>
              <p className="mt-1 text-xs text-gray-500">Дэмжигдэх формат: JPG, PNG, WEBP, GIF, HEIC (max 5MB)</p>
            </div>
        </div>
        )}

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
            disabled={!hasCartItems || !isPhoneValid || (paymentMethod === 'BANK_TRANSFER' && !receiptFile) || isSubmitting}
            className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 text-white font-bold text-lg py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300"
          >
            {isSubmitting ? 'Илгээж байна...' : 'Захиалга үүсгэх ✨'}
          </Button>
        </div>
      </>

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
