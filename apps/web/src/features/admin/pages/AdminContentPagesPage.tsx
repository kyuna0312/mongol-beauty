import { gql, useMutation, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mongol-beauty/ui';
import { Eye, Save } from 'lucide-react';

const GET_ADMIN_PAGES = gql`
  query GetAdminPages {
    adminPages {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      isPublished
      updatedAt
    }
  }
`;

const UPSERT_PAGE = gql`
  mutation UpsertPage($input: UpsertPageInput!) {
    upsertPage(input: $input) {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      isPublished
      updatedAt
    }
  }
`;

const PAGE_ORDER = ['about', 'faq', 'shipping', 'returns', 'privacy'] as const;

export function AdminContentPagesPage() {
  const { data, loading, refetch } = useQuery(GET_ADMIN_PAGES, { fetchPolicy: 'cache-and-network' });
  const [upsertPage, { loading: saving }] = useMutation(UPSERT_PAGE);
  const [activeSlug, setActiveSlug] = useState<string>('about');

  const pages = useMemo(() => {
    const list = data?.adminPages ?? [];
    return [...list].sort(
      (a: any, b: any) => PAGE_ORDER.indexOf(a.slug as any) - PAGE_ORDER.indexOf(b.slug as any),
    );
  }, [data]);

  const activePage = pages.find((p: any) => p.slug === activeSlug);

  const [form, setForm] = useState({
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    isPublished: true,
  });

  useEffect(() => {
    if (!activePage) return;
    setForm({
      title: activePage.title ?? '',
      content: activePage.content ?? '',
      metaTitle: activePage.metaTitle ?? '',
      metaDescription: activePage.metaDescription ?? '',
      isPublished: activePage.isPublished ?? true,
    });
  }, [activePage]);

  const handleSave = async () => {
    if (!activeSlug) return;
    await upsertPage({
      variables: {
        input: {
          slug: activeSlug,
          title: form.title,
          content: form.content,
          metaTitle: form.metaTitle.trim() || undefined,
          metaDescription: form.metaDescription.trim() || undefined,
          isPublished: form.isPublished,
        },
      },
    });
    await refetch();
  };

  if (loading) return <div className="p-6">Loading content pages...</div>;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Контент хуудсууд</h1>
        <p className="text-sm text-gray-500">Privacy, Shipping, Returns, FAQ, About хуудсуудыг эндээс засна.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
        <aside className="bg-white rounded-xl border border-gray-200 p-3 space-y-2 h-fit">
          {pages.map((page: any) => (
            <button
              key={page.slug}
              type="button"
              onClick={() => setActiveSlug(page.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                activeSlug === page.slug
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className="capitalize">{page.slug}</div>
              <div className="text-xs text-gray-500 truncate">{page.title}</div>
            </button>
          ))}
        </aside>

        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Гарчиг</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO гарчиг (meta title)</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Хоосон бол дээрх гарчиг ашиглана"
                value={form.metaTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, metaTitle: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SEO тайлбар (meta description)</label>
              <textarea
                className="w-full min-h-[88px] border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Хоосон бол контентоос автоматаар"
                value={form.metaDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, metaDescription: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Контент (Markdown дэмжинэ)
            </label>
            <textarea
              className="w-full min-h-[320px] border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm"
              value={form.content}
              onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
            />
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            Нийтлэх
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
            <Link
              to={`/admin/preview/${activeSlug}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100/80 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Урьдчилан харах
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
