import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      totalPrice
      status
      paymentReceiptUrl
      createdAt
      items {
        id
        quantity
        price
        product {
          id
          name
          images
        }
      }
    }
  }
`;

const statusConfig = {
  WAITING_PAYMENT: {
    label: 'Төлбөр хүлээж байна',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  CONFIRMED: {
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
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
};

export function OrderPage() {
  const { id } = useParams();
  const { data, loading } = useQuery(GET_ORDER, {
    variables: { id },
  });

  if (loading) {
    return <div className="p-4">Уншиж байна...</div>;
  }

  const order = data?.order;
  if (!order) {
    return <div className="p-4">Захиалга олдсонгүй</div>;
  }

  const status = statusConfig[order.status as keyof typeof statusConfig];

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

      {/* Order Items */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
        <h3 className="font-semibold mb-3">Захиалгын бүтээгдэхүүн</h3>
        <div className="space-y-3">
          {order.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.product.images?.[0] || '/placeholder-product.jpg'}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
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
