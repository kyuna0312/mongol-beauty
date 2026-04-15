import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, CheckCircle, XCircle, Truck, AlertTriangle, X, type LucideIcon } from 'lucide-react';
import { GET_ADMIN_ORDERS } from '@/graphql/queries';
import { UPDATE_ORDER_STATUS } from '@/graphql/mutations';
import { AdminOrder, AdminOrdersPageData, OrderStatus } from '@/interfaces/admin';
import { ordersListUrl } from '@/lib/admin-orders-url';

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<OrderStatus, { label: string; badgeCls: string; icon: LucideIcon }> = {
  WAITING_PAYMENT: { label: 'Хүлээж байна',    badgeCls: 'bg-amber-100 text-amber-700',  icon: Package },
  PAID_CONFIRMED:  { label: 'Баталгаажсан',    badgeCls: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  SHIPPING:        { label: 'Хүргэлтэнд',      badgeCls: 'bg-purple-100 text-purple-700', icon: Truck },
  COMPLETED:       { label: 'Дууссан',          badgeCls: 'bg-green-100 text-green-700',  icon: CheckCircle },
  CANCELLED:       { label: 'Цуцлагдсан',      badgeCls: 'bg-gray-100 text-gray-500',    icon: XCircle },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as OrderStatus[];

interface PendingAction {
  orderId: string;
  nextStatus: string;
  label: string;
}

export function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') as OrderStatus | null;
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const [pendingAction, setPendingAction]   = useState<PendingAction | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [mutationError, setMutationError]   = useState<string | null>(null);
  const [previewUrl, setPreviewUrl]         = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDERS, {
    variables: { limit: PAGE_SIZE, offset, status: statusFilter || undefined },
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => refetch(),
  });

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setMutationError(null);
    try {
      await updateOrderStatus({ variables: { orderId, status: newStatus } });
      setPendingAction(null);
    } catch (err: unknown) {
      setMutationError(err instanceof Error ? err.message : 'Алдаа гарлаа');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />)}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-gray-100 rounded" />
              <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-3 w-48 bg-gray-100 rounded" />
            <div className="h-10 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">Мэдээлэл ачаалахад алдаа гарлаа</p>
            <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const pageData   = data?.adminOrders as AdminOrdersPageData | undefined;
  const orders     = (pageData?.items ?? []) as AdminOrder[];
  const total      = pageData?.total ?? 0;
  const pageCount  = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Захиалгууд</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total > 0
              ? `Нийт ${total} захиалга`
              : 'Захиалга байхгүй байна'}
          </p>
        </div>
      </div>

      {/* Mutation error banner */}
      {mutationError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertTriangle size={14} className="flex-shrink-0" />
            {mutationError}
          </div>
          <button type="button" onClick={() => setMutationError(null)} className="text-red-400 hover:text-red-600 ml-3">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Pending action confirm */}
      {pendingAction && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
          <p className="text-sm text-primary-900">
            <span className="font-mono font-medium">#{pendingAction.orderId.slice(0, 8)}</span> захиалгын
            төлөвийг <span className="font-semibold">{pendingAction.label}</span> болгох уу?
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setPendingAction(null)}
              disabled={!!updatingOrderId}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Болих
            </button>
            <button
              onClick={() => handleStatusUpdate(pendingAction.orderId, pendingAction.nextStatus)}
              disabled={!!updatingOrderId}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {updatingOrderId ? 'Хадгалж байна...' : 'Тийм, өөрчлөх'}
            </button>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          to="/admin/orders"
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
            !statusFilter
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Бүгд
        </Link>
        {ALL_STATUSES.map((status) => (
          <Link
            key={status}
            to={ordersListUrl({ status })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {STATUS_CONFIG[status].label}
          </Link>
        ))}
      </div>

      {/* Orders list */}
      {orders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Package size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Захиалга олдсонгүй</p>
          <p className="text-xs text-gray-400 mt-1">Шүүлтүүрийг өөрчилнө үү</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const cfg   = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.WAITING_PAYMENT;
            const Icon  = cfg.icon;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
              >
                {/* Order header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-mono font-semibold text-gray-800">#{order.id.slice(0, 8)}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.badgeCls}`}>
                      <Icon size={11} />
                      {cfg.label}
                    </span>
                  </div>
                  <span className="text-base font-semibold text-gray-900 flex-shrink-0 ml-4">
                    {order.totalPrice.toLocaleString()}₮
                  </span>
                </div>

                {/* Order body */}
                <div className="px-5 py-4 space-y-4">
                  {/* Meta */}
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500">
                    <span>Огноо: {new Date(order.createdAt).toLocaleDateString('mn-MN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    {order.user && (
                      <span>Хэрэглэгч: {order.user.name || '—'} {order.user.phone ? `• ${order.user.phone}` : ''}</span>
                    )}
                    <span>Шинэчлэгдсэн: {new Date(order.updatedAt).toLocaleDateString('mn-MN')}</span>
                  </div>

                  {/* Delivery address */}
                  {order.deliveryAddress && (
                    <div className="flex items-start gap-2 text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <span className="text-blue-400 mt-0.5">📍</span>
                      <span className="text-blue-800 font-medium">Хүргэлтийн хаяг:</span>
                      <span className="text-blue-700">{order.deliveryAddress}</span>
                    </div>
                  )}

                  {/* Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span className="text-gray-700">
                            {item.product?.name ?? '—'}
                            <span className="text-gray-400 ml-1">× {item.quantity}</span>
                          </span>
                          <span className="font-medium text-gray-800">{(item.price * item.quantity).toLocaleString()}₮</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Receipt */}
                  {order.paymentReceiptUrl && (
                    <div className="space-y-2">
                      <img
                        src={order.paymentReceiptUrl}
                        alt="Төлбөрийн баримт"
                        className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50 cursor-pointer"
                        onClick={() => setPreviewUrl(order.paymentReceiptUrl || null)}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewUrl(order.paymentReceiptUrl || null)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 border border-primary-200 rounded-lg px-3 py-1.5 hover:bg-primary-50 transition-colors"
                        >
                          🖼 Баримт харах
                        </button>
                        <a
                          href={order.paymentReceiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                          📄 Шинэ цонхоор
                        </a>
                      </div>
                    </div>
                  )}
                  {!order.paymentReceiptUrl && order.status === 'WAITING_PAYMENT' && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      ⚠️ Баримт оруулаагүй байна
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 flex-wrap pt-1">
                    {order.status === 'WAITING_PAYMENT' && (
                      <>
                        <button
                          disabled={isUpdating}
                          onClick={() => setPendingAction({ orderId: order.id, nextStatus: 'PAID_CONFIRMED', label: 'Баталгаажсан' })}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          ✓ Төлбөр баталгаажуулах
                        </button>
                        <button
                          disabled={isUpdating}
                          onClick={() => setPendingAction({ orderId: order.id, nextStatus: 'CANCELLED', label: 'Цуцлагдсан' })}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          ✕ Цуцлах
                        </button>
                      </>
                    )}
                    {order.status === 'PAID_CONFIRMED' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => setPendingAction({ orderId: order.id, nextStatus: 'SHIPPING', label: 'Хүргэлтэнд' })}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        🚚 Хүргэлтэд гаргах
                      </button>
                    )}
                    {order.status === 'SHIPPING' && (
                      <button
                        disabled={isUpdating}
                        onClick={() => setPendingAction({ orderId: order.id, nextStatus: 'COMPLETED', label: 'Дууссан' })}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                      >
                        ✓ Дуусгах
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Link
            to={ordersListUrl({ page: page - 1, status: statusFilter })}
            aria-disabled={page <= 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              page <= 1
                ? 'pointer-events-none border-gray-100 text-gray-300'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            ← Өмнөх
          </Link>
          <span className="text-sm text-gray-600 px-2">{page} / {pageCount}</span>
          <Link
            to={ordersListUrl({ page: page + 1, status: statusFilter })}
            aria-disabled={page >= pageCount}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              page >= pageCount
                ? 'pointer-events-none border-gray-100 text-gray-300'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Дараах →
          </Link>
        </div>
      )}

      {/* Receipt preview modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Төлбөрийн баримт</h3>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 bg-gray-50">
              <img
                src={previewUrl}
                alt="Баримт"
                className="max-h-[70vh] w-full rounded-xl object-contain bg-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
