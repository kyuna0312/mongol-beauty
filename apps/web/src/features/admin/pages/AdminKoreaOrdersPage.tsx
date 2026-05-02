import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Plane, Edit2, Check, X } from 'lucide-react';
import { GET_ADMIN_ORDERS } from '@/graphql/queries';
import { UPDATE_KOREA_ORDER_FIELDS } from '@/graphql/mutations';
import { AdminOrder } from '@/interfaces/admin';
import { useAdminFeedback } from '../hooks/useAdminFeedback';

const PAGE_SIZE = 20;

interface EditState {
  orderId: string;
  supplierName: string;
  koreaTrackingId: string;
  estimatedDays: string;
}

export function AdminKoreaOrdersPage() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const [editing, setEditing] = useState<EditState | null>(null);
  const { success, setSuccess } = useAdminFeedback();

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_ORDERS, {
    variables: { limit: PAGE_SIZE, offset },
  });

  const [updateKoreaFields, { loading: saving }] = useMutation(UPDATE_KOREA_ORDER_FIELDS, {
    onCompleted: () => {
      refetch();
      setEditing(null);
      setSuccess('Солонгос захиалгын мэдээлэл шинэчлэгдлээ');
    },
  });

  const allOrders: AdminOrder[] = data?.adminOrders?.items ?? [];
  const total: number = data?.adminOrders?.total ?? 0;

  // Show orders that have any Korea-related field set, or all orders for management
  const orders = allOrders.filter(
    (o) => o.supplierName || o.koreaTrackingId || o.estimatedDays,
  );

  const startEdit = (order: AdminOrder) => {
    setEditing({
      orderId: order.id,
      supplierName: order.supplierName ?? '',
      koreaTrackingId: order.koreaTrackingId ?? '',
      estimatedDays: order.estimatedDays ?? '',
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    await updateKoreaFields({
      variables: {
        input: {
          orderId: editing.orderId,
          supplierName: editing.supplierName || undefined,
          koreaTrackingId: editing.koreaTrackingId || undefined,
          estimatedDays: editing.estimatedDays || undefined,
        },
      },
    });
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Plane className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Солонгос захиалга</h1>
      </div>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      )}

      {loading && <p className="text-gray-500">Уншиж байна...</p>}
      {error && <p className="text-red-500">Алдаа: {error.message}</p>}

      {!loading && orders.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center">
          <Plane className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-500">Солонгос захиалга байхгүй байна</p>
        </div>
      )}

      {orders.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Захиалга</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Нийлүүлэгч</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tracking ID</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Хугацаа (өдөр)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Бүтээгдэхүүн</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Огноо</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const isEditing = editing?.orderId === order.id;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      #{order.id.slice(-8)}
                      {order.user?.name && (
                        <div className="text-gray-400">{order.user.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="w-32 rounded border border-gray-300 px-2 py-1 text-sm"
                          value={editing.supplierName}
                          onChange={(e) => setEditing({ ...editing, supplierName: e.target.value })}
                          placeholder="Нийлүүлэгч"
                        />
                      ) : (
                        <span className="text-gray-800">{order.supplierName ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="w-36 rounded border border-gray-300 px-2 py-1 text-sm font-mono"
                          value={editing.koreaTrackingId}
                          onChange={(e) => setEditing({ ...editing, koreaTrackingId: e.target.value })}
                          placeholder="Tracking ID"
                        />
                      ) : (
                        <span className="font-mono text-blue-700">{order.koreaTrackingId ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                          value={editing.estimatedDays}
                          onChange={(e) => setEditing({ ...editing, estimatedDays: e.target.value })}
                          placeholder="7-14"
                        />
                      ) : (
                        <span className="text-gray-700">{order.estimatedDays ?? '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <ul className="space-y-0.5 text-xs text-gray-600">
                        {order.items?.map((item) => (
                          <li key={item.id}>
                            {item.product?.name ?? 'Тодорхойгүй'} × {item.quantity}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('mn-MN')}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="rounded bg-blue-600 p-1.5 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded bg-gray-200 p-1.5 text-gray-600 hover:bg-gray-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(order)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            ← Өмнөх
          </button>
          <span className="px-3 py-1 text-sm text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
          >
            Дараах →
          </button>
        </div>
      )}
    </div>
  );
}
