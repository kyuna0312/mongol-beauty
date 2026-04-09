import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mongol-beauty/ui';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/mutations';
import { GET_PRODUCT_DETAIL } from '@/graphql/catalog';
import { GET_HOME_CATEGORIES } from '@/graphql/home';

const SkinTypes = ['OILY', 'DRY', 'COMBINATION', 'SENSITIVE', 'NORMAL'];
const Features = ['ANTI_AGING', 'HYDRATING', 'BRIGHTENING', 'ACNE_FIGHTING', 'SUNSCREEN', 'ORGANIC'];

export function AdminProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { id },
    skip: !id,
  });

  const { data: categoriesData } = useQuery(GET_HOME_CATEGORIES);
  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    stock: '',
    description: '',
    skinType: [] as string[],
    features: [] as string[],
    images: [''] as string[],
  });

  useEffect(() => {
    if (productData?.product) {
      const product = productData.product;
      setFormData({
        name: product.name || '',
        categoryId: product.category?.id || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        description: product.description || '',
        skinType: Array.isArray(product.skinType) ? product.skinType : [],
        features: Array.isArray(product.features) ? product.features : [],
        images: Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : [''],
      });
    }
  }, [productData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = {
      ...(isEdit ? { id } : {}),
      name: formData.name,
      categoryId: formData.categoryId,
      price: parseInt(formData.price),
      stock: parseInt(formData.stock) || 0,
      description: formData.description,
      skinType: formData.skinType,
      features: formData.features,
      images: formData.images.filter((img) => img.trim()),
    };

    try {
      if (isEdit) {
        await updateProduct({ variables: { input } });
      } else {
        await createProduct({ variables: { input } });
      }
      navigate('/admin/products');
    } catch (error: unknown) {
      alert(`Алдаа: ${error instanceof Error ? error.message : 'Алдаа гарлаа'}`);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter((i) => i !== item)
      : [...array, item];
  };

  if (productLoading) {
    return <div className="p-4">Ачааллаж байна...</div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
          {isEdit ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн'}
        </h1>
        <p className="text-gray-500">
          {isEdit ? 'Бүтээгдэхүүний мэдээллийг шинэчлэх' : 'Шинэ бүтээгдэхүүн нэмэх'}
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
            placeholder="Бүтээгдэхүүний нэр"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ангилал *</label>
          <select
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white"
            required
          >
            <option value="">Сонгох...</option>
            {categoriesData?.categories?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Үнэ (₮) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              placeholder="0"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Нөөц *</label>
            <input
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
              placeholder="0"
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Тайлбар</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none resize-none"
            rows={4}
            placeholder="Бүтээгдэхүүний дэлгэрэнгүй тайлбар..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Арьсны төрөл</label>
          <div className="flex flex-wrap gap-2">
            {SkinTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    skinType: toggleArrayItem(formData.skinType, type),
                  })
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.skinType.includes(type)
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Онцлог</label>
          <div className="flex flex-wrap gap-2">
            {Features.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    features: toggleArrayItem(formData.features, feature),
                  })
                }
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.features.includes(feature)
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Зургийн URL</label>
          {formData.images.map((img, index) => (
            <div key={index} className="mb-3">
              <input
                type="url"
                value={img}
                onChange={(e) => {
                  const newImages = [...formData.images];
                  newImages[index] = e.target.value;
                  setFormData({ ...formData, images: newImages });
                }}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                placeholder="https://example.com/image.jpg"
              />
              {img && (
                <img
                  src={img}
                  alt={`Preview ${index + 1}`}
                  className="mt-2 w-24 h-24 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, images: [...formData.images, ''] })
            }
            className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1 transition-colors"
          >
            <span className="text-lg">+</span>
            Зураг нэмэх
          </button>
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
            onClick={() => navigate('/admin/products')}
            className="sm:w-auto"
          >
            Цуцлах
          </Button>
        </div>
      </form>
    </div>
  );
}
