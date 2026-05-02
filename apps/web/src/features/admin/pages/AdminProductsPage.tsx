import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import { GET_ADMIN_PRODUCTS } from '@/graphql/queries';
import { DELETE_PRODUCT } from '@/graphql/mutations';

export function AdminProductsPage() {
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const { data, loading, error } = useQuery(GET_ADMIN_PRODUCTS);
  const [deleteProduct, { loading: deleting }] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_ADMIN_PRODUCTS }],
    onCompleted: () => setConfirmDeleteId(null),
    onError: (err) => setDeleteError(err.message),
  });

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleteError(null);
    await deleteProduct({ variables: { id: confirmDeleteId } });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-3 animate-pulse">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      </div>
    );
  }

  const products = data?.adminProducts || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} бүтээгдэхүүн</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Шинэ бүтээгдэхүүн
        </button>
      </div>

      {/* Delete error */}
      {deleteError && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <span className="text-sm text-red-800">{deleteError}</span>
          <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-600 ml-3">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Delete confirm banner */}
      {confirmDeleteId && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-900">
            Та энэ бүтээгдэхүүнийг <span className="font-semibold">устгах</span> уу? Энэ үйлдлийг буцаах боломжгүй.
          </p>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setConfirmDeleteId(null)}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Болих
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting ? 'Устгаж байна...' : 'Тийм, устгах'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {products.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Package size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">Бүтээгдэхүүн байхгүй</p>
          <p className="text-xs text-gray-400 mb-5">Эхний бүтээгдэхүүнээ нэмж эхлээрэй</p>
          <button
            onClick={() => navigate('/admin/products/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={15} /> Бүтээгдэхүүн нэмэх
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {products.map((product: any) => (
            <div
              key={product.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-sm ${
                confirmDeleteId === product.id ? 'border-red-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Thumbnail */}
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-gray-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-primary-600">{product.price.toLocaleString()}₮</span>
                    <span>•</span>
                    <span className={product.stock < 10 ? 'text-amber-600 font-medium' : ''}>
                      Нөөц: {product.stock}
                    </span>
                    {product.category && (
                      <>
                        <span>•</span>
                        <span className="truncate">{product.category.name}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Засах"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(product.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Устгах"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
