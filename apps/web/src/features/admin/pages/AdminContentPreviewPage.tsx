import { useQuery } from '@apollo/client';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { MarkdownContent } from '@/features/content/components/MarkdownContent';
import { PageHead } from '@/features/content/components/PageHead';
import { GET_PAGE_PREVIEW } from '@/graphql/queries';

const KNOWN_SLUGS = new Set(['about', 'faq', 'shipping', 'returns', 'privacy']);

export function AdminContentPreviewPage() {
  const { slug = '' } = useParams<{ slug: string }>();

  const { data, loading, error } = useQuery(GET_PAGE_PREVIEW, {
    variables: { slug },
    skip: !slug || !KNOWN_SLUGS.has(slug),
    fetchPolicy: 'network-only',
  });

  if (!slug || !KNOWN_SLUGS.has(slug)) {
    return <Navigate to="/admin/content" replace />;
  }

  if (loading) {
    return (
      <div className="mb-page">
        <div className="mb-card-surface p-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-stone-200 mb-4" />
          <div className="h-4 w-full rounded bg-stone-200 mb-2" />
          <div className="h-4 w-11/12 rounded bg-stone-200" />
        </div>
      </div>
    );
  }

  if (error || !data?.pagePreview) {
    return <Navigate to="/admin/content" replace />;
  }

  const page = data.pagePreview;
  const publicPath = `/${slug}`;

  return (
    <div className="mb-page space-y-4">
      <PageHead
        pageTitle={page.title}
        metaTitle={page.metaTitle}
        metaDescription={page.metaDescription}
        contentMarkdown={page.content}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            page.isPublished
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
              : 'bg-amber-50 text-amber-900 border border-amber-200/90'
          }`}
        >
          {page.isPublished ? 'Нийтлэгдсэн (урьдчилан харах)' : 'Ноорог — зочдод харагдахгүй'}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/content"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            ← Контент руу буцах
          </Link>
          <a
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-800"
          >
            Нийтийн хуудас
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <article className="mb-card-surface p-6 md:p-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-800 mb-4">
          {page.title}
        </h1>
        <MarkdownContent markdown={page.content} />
      </article>
    </div>
  );
}
