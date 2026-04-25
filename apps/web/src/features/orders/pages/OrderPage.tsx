import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { CheckCircle, Clock, Truck, XCircle, Package } from 'lucide-react';
import { GET_ORDER_DETAIL } from '@/graphql/orders';
import { OrderData } from '@/interfaces/order';

const statusConfig = {
  WAITING_PAYMENT: {
    label: 'Төлбөр хүлээж байна',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  PAID_CONFIRMED: {
    label: 'Баталгаажсан',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  SHIPPING: {
    label: 'Хүргэж байна',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  COMPLETED: {
    label: 'Дууссан',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  CANCELLED: {
    label: 'Цуцлагдсан',
    icon: XCircle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
  },
};

// Korea 5-step tracking: maps order status + tracking fields to a step index (0-based)
function getKoreaStep(order: OrderData): number {
  if (order.status === 'COMPLETED') return 4;
  if (order.status === 'SHIPPING') return 3;
  if (order.koreaTrackingId) return 2;
  if (order.status === 'PAID_CONFIRMED') return 1;
  return 0;
}

const koreaSteps = [
  { label: 'Хүсэлт илгээгдсэн', sublabel: 'Захиалга хүлээн авлаа' },
  { label: 'Солонгосоос захиалсан', sublabel: 'Нийлүүлэгч захиалга баталгаажуулав' },
  { label: 'Агуулахад ирлээ', sublabel: 'Барааг хүлээн авч байна' },
  { label: 'Дотоодод хүргэж байна', sublabel: 'Таны хаяг руу явж байна' },
  { label: 'Хүргэгдсэн', sublabel: 'Захиалга амжилттай хүрлээ' },
];

export function OrderPage() {
  const { id } = useParams();
  const { data, loading } = useQuery(GET_ORDER_DETAIL, {
    variables: { id },
  });

  if (loading) {
    return <div className="p-4">Уншиж байна...</div>;
  }

  const order = data?.order as OrderData | undefined;
  if (!order) {
    return <div className="p-4">Захиалга олдсонгүй</div>;
  }

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const hasKoreanItem = order.items.some((item) => item.product.isKoreanProduct);
  const koreaStep = hasKoreanItem ? getKoreaStep(order) : -1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">Захиалгын дэлгэрэнгүй</h2>

      {/* Status Card */}
      <div className={`${status.bgColor} rounded-lg p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <status.icon className={`w-6 h-6 ${status.color}`} />
          <div>
            <p className="font-semibold">{status.label}</p>
            <p className="text-sm text-gray-600">
              Захиалгын дугаар: {order.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      {/* Korea Tracking */}
      {hasKoreanItem && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800 text-sm">Солонгосын захиалгын төлөв</h3>
          </div>

          {/* Step tracker */}
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-3.5 left-3.5 right-3.5 h-0.5 bg-gray-200" />
            <div
              className="absolute top-3.5 left-3.5 h-0.5 bg-blue-500 transition-all duration-500"
              style={{ width: koreaStep > 0 ? `${(koreaStep / (koreaSteps.length - 1)) * 100}%` : '0%' }}
            />
            <div className="relative flex justify-between">
              {koreaSteps.map((step, i) => {
                const done = i < koreaStep;
                const active = i === koreaStep;
                return (
                  <div key={i} className="flex flex-col items-center" style={{ width: `${100 / koreaSteps.length}%` }}>
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all z-10 bg-white ${
                        done ? 'border-blue-500 bg-blue-500' : active ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <span className={`text-xs font-bold ${active ? 'text-blue-500' : 'text-gray-400'}`}>{i + 1}</span>
                      )}
                    </div>
                    <p className={`text-center mt-1.5 text-xs font-medium leading-tight ${active ? 'text-blue-700' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active step sublabel */}
          <p className="text-xs text-blue-600 mt-3 text-center">{koreaSteps[koreaStep]?.sublabel}</p>

          {/* Tracking details */}
          {(order.supplierName || order.koreaTrackingId || order.estimatedDays) && (
            <div className="mt-3 pt-3 border-t border-blue-100 grid grid-cols-1 gap-1.5 text-xs text-gray-600">
              {order.supplierName && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Нийлүүлэгч:</span>
                  <span className="font-medium">{order.supplierName}</span>
                </div>
              )}
              {order.koreaTrackingId && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking ID:</span>
                  <span className="font-mono font-medium">{order.koreaTrackingId}</span>
                </div>
              )}
              {order.estimatedDays && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Хүргэлтийн хугацаа:</span>
                  <span className="font-medium">{order.estimatedDays} хоног</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <h3 className="font-semibold mb-3">Захиалгын бүтээгдэхүүн</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.product.images?.[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                {item.product.isKoreanProduct && (
                  <span className="inline-block text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5 mt-0.5 mb-0.5">
                    🇰🇷 Солонгосын бүтээгдэхүүн
                  </span>
                )}
                <p className="text-sm text-gray-600">
                  {item.quantity} x {item.price.toLocaleString()}₮
                </p>
              </div>
              <p className="font-semibold">
                {(item.price * item.quantity).toLocaleString()}₮
              </p>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between font-bold">
          <span>Нийт:</span>
          <span className="text-primary-600">{order.totalPrice.toLocaleString()}₮</span>
        </div>
      </div>

      {/* Payment Receipt */}
      {order.paymentReceiptUrl && (
        <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h3 className="font-semibold mb-2">Төлбөрийн баримт</h3>
          <img
            src={order.paymentReceiptUrl}
            alt="Payment receipt"
            className="w-full rounded-lg"
          />
        </div>
      )}

      {/* Order Date */}
      <div className="text-sm text-gray-500 text-center">
        Захиалга үүсгэсэн: {new Date(order.createdAt).toLocaleString('mn-MN')}
      </div>
    </div>
  );
}
