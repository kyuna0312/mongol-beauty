import { useQuery, useMutation } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@mongol-beauty/ui';
import { GET_ADMIN_ORDERS } from '@/graphql/queries';
import { UPDATE_ORDER_STATUS } from '@/graphql/mutations';

const OrderStatusConfig: Record<string, { label: string; color: string; icon: any }> = {
  WAITING_PAYMENT: { label: 'Төлбөр хүлээж байна', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  CONFIRMED: { label: 'Баталгаажсан', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  SHIPPING: { label: 'Хүргэж байна', color: 'bg-purple-100 text-purple-700', icon: Truck },
  COMPLETED: { label: 'Дууссан', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Цуцлагдсан', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDERS);
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus({
        variables: { orderId, status: newStatus },
      });
    } catch (err: any) {
      alert(`Алдаа: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-800 font-semibold mb-1">Алдаа гарлаа</p>
          <p className="text-red-600 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  let orders = data?.adminOrders || [];
  if (statusFilter) {
    orders = orders.filter((o: any) => o.status === statusFilter);
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Захиалга удирдах
        </h1>
        <p className="text-gray-500">{orders.length} захиалга</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <Link
          to="/admin/orders"
          className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            !statusFilter
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Бүгд
        </Link>
        {Object.entries(OrderStatusConfig).map(([status, config]) => {
          const StatusIcon = config.icon;
          return (
            <Link
              key={status}
              to={`/admin/orders?status=${status}`}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                statusFilter === status
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <StatusIcon className="w-4 h-4" />
              {config.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Захиалга олдсонгүй</p>
          <p className="text-gray-500">Одоогоор захиалга байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any, index: number) => {
            const statusConfig = OrderStatusConfig[order.status] || OrderStatusConfig.WAITING_PAYMENT;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">#{order.id.slice(0, 8)}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      {new Date(order.createdAt).toLocaleDateString('mn-MN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {order.user && (
                      <p className="text-sm text-gray-600">
                        👤 {order.user.name} • {order.user.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      {order.totalPrice.toLocaleString()}₮
                    </p>
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Бүтээгдэхүүн:</p>
                  <div className="space-y-2">
                    {order.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm bg-white p-2 rounded-lg"
                      >
                        <span className="text-gray-700">
                          {item.product?.name} <span className="text-gray-500">x {item.quantity}</span>
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.price.toLocaleString()}₮
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {order.paymentReceiptUrl && (
                  <div className="mb-4">
                    <a
                      href={order.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                    >
                      <span>📄</span>
                      Төлбөрийн баримт харах
                    </a>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200">
                  {order.status === 'WAITING_PAYMENT' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'CONFIRMED')}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                      >
                        ✓ Баталгаажуулах
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        ✕ Цуцлах
                      </Button>
                    </>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'SHIPPING')}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    >
                      🚚 Хүргэлтэд гаргах
                    </Button>
                  )}
                  {order.status === 'SHIPPING' && (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(order.id, 'COMPLETED')}
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-md"
                    >
                      ✓ Дуусгах
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
