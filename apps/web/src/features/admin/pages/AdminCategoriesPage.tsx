import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Folder, AlertTriangle, X } from 'lucide-react';
import { DELETE_CATEGORY } from '@/graphql/mutations';
import { GET_ADMIN_CATEGORIES } from '@/graphql/queries';

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleteError, setDeleteError]         = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(GET_ADMIN_CATEGORIES);
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => { refetch(); setConfirmDeleteId(null); },
    onError: (err) => setDeleteError(err.message),
  });

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    setDeleteError(null);
    await deleteCategory({ variables: { id: confirmDeleteId } });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
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

  const categories = data?.categories || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Ангилал</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} ангилал</p>
        </div>
        <button
          onClick={() => navigate('/admin/categories/new')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Шинэ ангилал
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
            Та энэ ангиллыг <span className="font-semibold">устгах</span> уу? Дотор байгаа бүтээгдэхүүнд нөлөөлнө.
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
      {categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
          <Folder size={36} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 mb-1">Ангилал байхгүй</p>
          <p className="text-xs text-gray-400 mb-5">Эхний ангиллыг нэмж эхлээрэй</p>
          <button
            onClick={() => navigate('/admin/categories/new')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={15} /> Ангилал нэмэх
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category: any) => (
            <div
              key={category.id}
              className={`bg-white border rounded-xl overflow-hidden transition-all hover:shadow-sm group ${
                confirmDeleteId === category.id ? 'border-red-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Cover image */}
              {category.imageUrl ? (
                <div className="h-36 overflow-hidden bg-gray-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-36 bg-gray-50 flex items-center justify-center">
                  <Folder size={32} className="text-gray-300" />
                </div>
              )}

              {/* Info row */}
              <div className="flex items-start justify-between p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{category.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{category.products?.length ?? 0} бүтээгдэхүүн</p>
                  {category.description && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                  <button
                    onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Засах"
                  >
                    <Edit size={13} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(category.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Устгах"
                  >
                    <Trash2 size={13} />
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
