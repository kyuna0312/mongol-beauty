import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { CREATE_CATEGORY, UPDATE_CATEGORY } from '@/graphql/mutations';
import { GET_ADMIN_CATEGORY, GET_ADMIN_CATEGORIES } from '@/graphql/queries';
import { useAdminFeedback } from '../hooks/useAdminFeedback';

export function AdminCategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { error: formError, success: formSuccess, loading: submitting, run } = useAdminFeedback();

  const { data: categoryData, loading: categoryLoading } = useQuery(GET_ADMIN_CATEGORY, {
    variables: { id },
    skip: !id,
  });
  const { data: allCategoriesData } = useQuery(GET_ADMIN_CATEGORIES);

  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    parentId: '',
  });

  useEffect(() => {
    if (categoryData?.category) {
      const category = categoryData.category;
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        imageUrl: category.imageUrl || '',
        parentId: category.parentId || '',
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
      parentId: formData.parentId || undefined,
    };

    await run(async () => {
      if (isEdit) {
        await updateCategory({ variables: { input } });
      } else {
        await createCategory({ variables: { input } });
      }
      navigate('/admin/categories');
    }, isEdit ? 'Ангилал шинэчлэгдлээ' : 'Ангилал нэмэгдлээ');
  };

  if (categoryLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/categories')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Ангилал засах' : 'Шинэ ангилал'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Ангиллын мэдээллийг шинэчлэх' : 'Шинэ ангилал нэмэх'}
          </p>
        </div>
      </div>

      {/* Feedback */}
      {formError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> {formError}
        </div>
      )}
      {formSuccess && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
          <CheckCircle size={14} className="flex-shrink-0" /> {formSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">Ангиллын мэдээлэл</h2>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Нэр <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white placeholder-gray-400 transition-shadow"
              placeholder="Ангиллын нэр"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Slug <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white placeholder-gray-400 transition-shadow"
              placeholder="auto-generated"
              required
            />
            <p className="text-xs text-gray-400 mt-1.5">URL-д ашиглагдах товч нэр (жишээ: facial-skincare)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Тайлбар</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow"
              rows={3}
              placeholder="Ангиллын дэлгэрэнгүй тайлбар..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Зургийн URL</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white placeholder-gray-400 transition-shadow"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Эцэг ангилал</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-shadow"
            >
              <option value="">Үндсэн ангилал (эцэггүй)</option>
              {(allCategoriesData?.categories || [])
                .filter((c: any) => c.id !== id)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Хадгалж байна...' : isEdit ? 'Хадгалах' : 'Үүсгэх'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/categories')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Цуцлах
          </button>
        </div>
      </form>
    </div>
  );
}
