import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, CheckCircle, XCircle, Truck, type LucideIcon } from 'lucide-react';
import { Button } from '@mongol-beauty/ui';
import { GET_ADMIN_ORDERS } from '@/graphql/queries';
import { UPDATE_ORDER_STATUS } from '@/graphql/mutations';
import { AdminOrder, AdminOrdersPageData, OrderStatus } from '@/interfaces/admin';
import { ordersListUrl } from '@/lib/admin-orders-url';

const PAGE_SIZE = 20;

const OrderStatusConfig: Record<OrderStatus, { label: string; color: string; icon: LucideIcon }> = {
  WAITING_PAYMENT: { label: 'Төлбөр хүлээж байна', color: 'bg-yellow-100 text-yellow-700', icon: Package },
  PAID_CONFIRMED: { label: 'Төлбөр баталгаажсан', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  SHIPPING: { label: 'Хүргэж байна', color: 'bg-purple-100 text-purple-700', icon: Truck },
  COMPLETED: { label: 'Дууссан', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Цуцлагдсан', color: 'bg-amber-100 text-amber-700', icon: XCircle },
};

export function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const [pendingAction, setPendingAction] = useState<{
    orderId: string;
    nextStatus: string;
    label: string;
  } | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDERS, {
    variables: {
      limit: PAGE_SIZE,
      offset,
      status: statusFilter || undefined,
    },
  });
  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus({
        variables: { orderId, status: newStatus },
      });
      setPendingAction(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Төлөв шинэчлэх үед алдаа гарлаа';
      alert(`Алдаа: ${message}`);
    } finally {
      setUpdatingOrderId(null);
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-amber-500 text-4xl mb-3">⚠️</div>
          <p className="text-amber-800 font-semibold mb-1">Алдаа гарлаа</p>
          <p className="text-amber-700 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  const pageData = data?.adminOrders as AdminOrdersPageData | undefined;
  const orders = (pageData?.items ?? []) as AdminOrder[];
  const total = pageData?.total ?? 0;
  const limit = pageData?.limit ?? PAGE_SIZE;
  const pageOffset = pageData?.offset ?? offset;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          Захиалга удирдах
        </h1>
        <p className="text-gray-500">
          {total === 0
            ? '0 захиалга'
            : `${pageOffset + 1}–${Math.min(pageOffset + orders.length, total)} / ${total} захиалга`}
        </p>
      </div>

      {pendingAction && (
        <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-primary-900">
            Та <span className="font-semibold">#{pendingAction.orderId.slice(0, 8)}</span> захиалгыг{' '}
            <span className="font-semibold">{pendingAction.label}</span> төлөв рүү өөрчлөх үү?
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={updatingOrderId === pendingAction.orderId}
              className="border-primary-300 text-primary-700 hover:bg-primary-100"
            >
              Болих
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusUpdate(pendingAction.orderId, pendingAction.nextStatus)}
              disabled={updatingOrderId === pendingAction.orderId}
              className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
            >
              Батлах
            </Button>
          </div>
        </div>
      )}

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
              to={ordersListUrl({ status })}
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

      {orders.length === 0 && total === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Захиалга олдсонгүй</p>
          <p className="text-gray-500">Одоогоор захиалга байхгүй байна</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-amber-200 bg-amber-50/50">
          <p className="text-gray-700 mb-3">Энэ хуудас хоосон байна.</p>
          <Link
            to={ordersListUrl({ page: 1, status: statusFilter })}
            className="inline-flex rounded-xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Эхний хуудас руу буцах
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index: number) => {
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
                      Үүсгэсэн: {new Date(order.createdAt).toLocaleDateString('mn-MN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400 mb-1">
                      Шинэчилсэн: {new Date(order.updatedAt).toLocaleString('mn-MN')}
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
                    {order.items?.map((item) => (
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
                  <div className="mb-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewReceiptUrl(order.paymentReceiptUrl || null)}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-3 py-1.5 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors"
                    >
                      <span>🖼️</span>
                      Баримт урьдчилан харах
                    </button>
                    <a
                      href={order.paymentReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      <span>📄</span>
                      Шинэ цонхоор нээх
                    </a>
                  </div>
                )}
                {!order.paymentReceiptUrl && order.status === 'WAITING_PAYMENT' && (
                  <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    ⚠️ Баримтын зураг оруулаагүй байна.
                  </div>
                )}

                <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200">
                  {order.status === 'WAITING_PAYMENT' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() =>
                          setPendingAction({
                            orderId: order.id,
                            nextStatus: 'PAID_CONFIRMED',
                            label: 'Төлбөр баталгаажсан',
                          })
                        }
                        disabled={updatingOrderId === order.id}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-md"
                      >
                        ✓ Төлбөр баталгаажуулах
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPendingAction({
                            orderId: order.id,
                            nextStatus: 'CANCELLED',
                            label: 'Цуцлагдсан',
                          })
                        }
                        disabled={updatingOrderId === order.id}
                        className="text-primary-700 border-primary-300 hover:bg-primary-50"
                      >
                        ✕ Цуцлах
                      </Button>
                    </>
                  )}
                  {order.status === 'PAID_CONFIRMED' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setPendingAction({
                          orderId: order.id,
                          nextStatus: 'SHIPPING',
                          label: 'Хүргэж байна',
                        })
                      }
                      disabled={updatingOrderId === order.id}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md"
                    >
                      🚚 Хүргэлтэд гаргах
                    </Button>
                  )}
                  {order.status === 'SHIPPING' && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setPendingAction({
                          orderId: order.id,
                          nextStatus: 'COMPLETED',
                          label: 'Дууссан',
                        })
                      }
                      disabled={updatingOrderId === order.id}
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

      {total > 0 && pageCount > 1 && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={ordersListUrl({ page: page - 1, status: statusFilter })}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              page <= 1
                ? 'pointer-events-none border-gray-100 text-gray-300'
                : 'border-primary-200 text-primary-800 hover:bg-primary-50'
            }`}
            aria-disabled={page <= 1}
          >
            ← Өмнөх
          </Link>
          <span className="text-sm text-gray-600">
            {page} / {pageCount}
          </span>
          <Link
            to={ordersListUrl({ page: page + 1, status: statusFilter })}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
              page >= pageCount
                ? 'pointer-events-none border-gray-100 text-gray-300'
                : 'border-primary-200 text-primary-800 hover:bg-primary-50'
            }`}
            aria-disabled={page >= pageCount}
          >
            Дараах →
          </Link>
        </div>
      )}

      {previewReceiptUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewReceiptUrl(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">Төлбөрийн баримт</h3>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="rounded-lg border border-gray-200 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-50"
              >
                Хаах
              </button>
            </div>
            <img
              src={previewReceiptUrl}
              alt="Payment receipt preview"
              className="max-h-[75vh] w-full rounded-xl object-contain bg-gray-50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
