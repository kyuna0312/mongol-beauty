import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, X, AlertTriangle, CheckCircle, Eye, Code } from 'lucide-react';
import DOMPurify from 'dompurify';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '@/graphql/mutations';
import { GET_PRODUCT_DETAIL } from '@/graphql/catalog';
import { GET_HOME_CATEGORIES } from '@/graphql/home';
import { GET_ADMIN_PRODUCTS } from '@/graphql/queries';
import { useAdminFeedback } from '../hooks/useAdminFeedback';

const SkinTypeLabels: Record<string, string> = {
  OILY: 'Тосолог', DRY: 'Хуурай', COMBINATION: 'Холимог', SENSITIVE: 'Мэдрэмтгий', NORMAL: 'Хэвийн',
};
const FeatureLabels: Record<string, string> = {
  ANTI_AGING: 'Хөгширлийн эсрэг', HYDRATING: 'Чийгшүүлэх', BRIGHTENING: 'Цайруулах',
  ACNE_FIGHTING: 'Акнений эсрэг', SUNSCREEN: 'Наранд хамгаалах', ORGANIC: 'Органик',
};

const SkinTypes = Object.keys(SkinTypeLabels);
const Features  = Object.keys(FeatureLabels);

// DOMPurify-sanitized HTML preview — safe against XSS
function HtmlPreview({ html }: { html: string }) {
  const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
   
  return <div className="w-full min-h-24 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safe }} />;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white placeholder-gray-400 transition-shadow"
    />
  );
}

export function AdminProductFormPage() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;
  const { error: formError, success: formSuccess, loading: submitting, run } = useAdminFeedback();

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT_DETAIL, {
    variables: { id },
    skip: !id,
  });
  const { data: categoriesData } = useQuery(GET_HOME_CATEGORIES);

  const [createProduct] = useMutation(CREATE_PRODUCT, { refetchQueries: [{ query: GET_ADMIN_PRODUCTS }] });
  const [updateProduct] = useMutation(UPDATE_PRODUCT, { refetchQueries: [{ query: GET_ADMIN_PRODUCTS }] });

  const [htmlPreview, setHtmlPreview] = useState(false);
  const [form, setForm] = useState({
    name: '', categoryId: '', price: '', stock: '', description: '', descriptionHtml: '',
    skinType: [] as string[], features: [] as string[], images: [''] as string[],
    isKoreanProduct: false,
  });

  useEffect(() => {
    if (!productData?.product) return;
    const p = productData.product;
    setForm({
      name: p.name || '',
      categoryId: p.category?.id || '',
      price: p.price?.toString() || '',
      stock: p.stock?.toString() || '',
      description: p.description || '',
      descriptionHtml: p.descriptionHtml || '',
      skinType: Array.isArray(p.skinType) ? p.skinType : [],
      features: Array.isArray(p.features) ? p.features : [],
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [''],
      isKoreanProduct: p.isKoreanProduct ?? false,
    });
  }, [productData]);

  const toggle = (field: 'skinType' | 'features', value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value) ? f[field].filter((v) => v !== value) : [...f[field], value],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      ...(isEdit ? { id } : {}),
      name: form.name,
      categoryId: form.categoryId,
      price: parseInt(form.price),
      stock: parseInt(form.stock) || 0,
      description: form.description,
      descriptionHtml: form.descriptionHtml || undefined,
      skinType: form.skinType,
      features: form.features,
      images: form.images.filter((img) => img.trim()),
      isKoreanProduct: form.isKoreanProduct,
    };
    await run(async () => {
      if (isEdit) {
        await updateProduct({ variables: { input } });
      } else {
        await createProduct({ variables: { input } });
      }
      navigate('/admin/products');
    }, isEdit ? 'Бүтээгдэхүүн шинэчлэгдлээ' : 'Бүтээгдэхүүн нэмэгдлээ');
  };

  if (productLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto space-y-4 animate-pulse">
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
          onClick={() => navigate('/admin/products')}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Бүтээгдэхүүн засах' : 'Шинэ бүтээгдэхүүн'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isEdit ? 'Мэдээллийг шинэчлэх' : 'Шинэ бүтээгдэхүүн нэмэх'}
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
        {/* Basic info card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">Үндсэн мэдээлэл</h2>

          <div>
            <FieldLabel required>Нэр</FieldLabel>
            <TextInput
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Бүтээгдэхүүний нэр"
              required
            />
          </div>

          <div>
            <FieldLabel required>Ангилал</FieldLabel>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-shadow"
            >
              <option value="">Ангилал сонгох...</option>
              {categoriesData?.categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel required>Үнэ (₮)</FieldLabel>
              <TextInput
                type="number" min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0"
                required
              />
            </div>
            <div>
              <FieldLabel required>Нөөц</FieldLabel>
              <TextInput
                type="number" min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div>
            <FieldLabel>Тайлбар (энгийн текст)</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Бүтээгдэхүүний дэлгэрэнгүй тайлбар..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <FieldLabel>HTML тайлбар (форматтай)</FieldLabel>
              <button
                type="button"
                onClick={() => setHtmlPreview((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                {htmlPreview ? <Code size={12} /> : <Eye size={12} />}
                {htmlPreview ? 'HTML засах' : 'Харах'}
              </button>
            </div>
            {htmlPreview ? (
              <HtmlPreview html={form.descriptionHtml} />
            ) : (
              <textarea
                value={form.descriptionHtml}
                onChange={(e) => setForm({ ...form, descriptionHtml: e.target.value })}
                rows={5}
                placeholder="<p>HTML форматтай тайлбар...</p>"
                className="w-full px-3 py-2.5 text-sm font-mono border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-shadow"
              />
            )}
          </div>
        </div>

        {/* Tags card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">Шинж чанар</h2>

          <div>
            <FieldLabel>Арьсны төрөл</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {SkinTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggle('skinType', type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.skinType.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {SkinTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Онцлог</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {Features.map((feature) => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggle('features', feature)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    form.features.includes(feature)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {FeatureLabels[feature]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-2">
            <div>
              <p className="text-sm font-medium text-gray-700">🇰🇷 Солонгосын бүтээгдэхүүн</p>
              <p className="text-xs text-gray-500 mt-0.5">Захиалга Солонгосоос ирнэ. Хүргэлт 7–14 хоног</p>
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, isKoreanProduct: !f.isKoreanProduct }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isKoreanProduct ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={form.isKoreanProduct}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isKoreanProduct ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Images card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-800 pb-2 border-b border-gray-100">Зургууд</h2>
          {form.images.map((img, index) => (
            <div key={index} className="space-y-2">
              <div className="flex gap-2">
                <TextInput
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const next = [...form.images];
                    next[index] = e.target.value;
                    setForm({ ...form, images: next });
                  }}
                  placeholder="https://example.com/image.jpg"
                />
                {form.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== index) })}
                    className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {img && (
                <img
                  src={img}
                  alt={`Зураг ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm({ ...form, images: [...form.images, ''] })}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            <Plus size={13} /> Зураг нэмэх
          </button>
        </div>

        {/* Submit */}
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
            onClick={() => navigate('/admin/products')}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Цуцлах
          </button>
        </div>
      </form>
    </div>
  );
}
