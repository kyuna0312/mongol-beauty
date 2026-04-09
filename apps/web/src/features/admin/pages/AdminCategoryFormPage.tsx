import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mongol-beauty/ui';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '@/graphql/mutations';
import { GET_ADMIN_CATEGORY } from '@/graphql/queries';

export function AdminCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: categoryData, loading: categoryLoading } = useQuery(GET_ADMIN_CATEGORY, {
    variables: { id },
    skip: !id,
  });

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    if (categoryData?.category) {
      const category = categoryData.category;
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
      });
    }
  }, [categoryData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      ...(isEdit ? { id } : {}),
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      imageUrl: formData.imageUrl,
    };

    try {
      if (isEdit) {
        await updateCategory({ variables: { input } });
      } else {
        await createCategory({ variables: { input } });
      }
      navigate('/admin/categories');
    } catch (error: any) {
      alert(`Алдаа: ${error.message}`);
    }
  };

  if (categoryLoading) {
    return <div className="p-4">Ачааллаж байна...</div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          {isEdit ? 'Ангилал засах' : 'Шинэ ангилал'}
        </h1>
        <p className="text-gray-500">
          {isEdit ? 'Ангиллын мэдээллийг шинэчлэх' : 'Шинэ ангилал нэмэх'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-200">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Нэр *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            placeholder="Ангиллын нэр"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            placeholder="auto-generated"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            URL-д ашиглагдах товч нэр (жишээ: facial-skincare)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Тайлбар</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none resize-none"
            rows={3}
            placeholder="Ангиллын дэлгэрэнгүй тайлбар..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Зургийн URL</label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
            placeholder="https://example.com/image.jpg"
          />
          {formData.imageUrl && (
            <div className="mt-3">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isEdit ? 'Хадгалах' : 'Үүсгэх'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/categories')}
            className="sm:w-auto"
          >
            Цуцлах
          </Button>
        </div>
      </form>
    </div>
  );
}
