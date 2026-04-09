import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Folder } from 'lucide-react';
import { Button } from '@mongol-beauty/ui';
import { DELETE_CATEGORY } from '@/graphql/mutations';
import { GET_CATEGORIES } from '@/graphql/queries';

export function AdminCategoriesPage() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_CATEGORIES);
  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    onCompleted: () => {
      refetch();
    },
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`"${name}" ангиллыг устгах уу?`)) {
      try {
        await deleteCategory({ variables: { id } });
      } catch (err) {
        alert('Алдаа гарлаа');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
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

  const categories = data?.categories || [];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Ангилал удирдах
          </h1>
          <p className="text-gray-500">{categories.length} ангилал</p>
        </div>
        <Button
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Шинэ ангилал
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Ангилал байхгүй</p>
          <p className="text-gray-500 mb-6">Эхний ангиллыг нэмж эхлээрэй</p>
          <Button 
            onClick={() => navigate('/admin/categories/new')}
            className="shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Эхний ангилал нэмэх
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {category.imageUrl ? (
                <div className="relative h-40 overflow-hidden bg-gray-100">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Folder className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors flex-1">
                    {category.name}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/categories/${category.id}/edit`)}
                      className="hover:bg-primary-50 hover:border-primary-300 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id, category.name)}
                      className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  {category.products?.length || 0} бүтээгдэхүүн
                </p>
                {category.description && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
