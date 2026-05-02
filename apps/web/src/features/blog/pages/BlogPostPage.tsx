import { useQuery } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import DOMPurify from 'dompurify';
import { GET_BLOG_POST } from '@/graphql/queries';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading } = useQuery(GET_BLOG_POST, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: 'cache-and-network',
  });

  const post = data?.blogPost;

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 animate-pulse space-y-4">
        <div className="h-6 w-1/3 rounded bg-stone-100" />
        <div className="h-64 rounded-2xl bg-stone-100" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-4 rounded bg-stone-100 ${i % 3 === 2 ? 'w-2/3' : 'w-full'}`} />
          ))}
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-stone-500">Нийтлэл олдсонгүй.</p>
        <Link to="/blog" className="mt-4 inline-flex items-center gap-1.5 text-sm text-terracotta-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Блог руу буцах
        </Link>
      </div>
    );
  }

  const safeHtml = DOMPurify.sanitize(post.contentHtml ?? '');

  return (
    <article className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/blog" className="mb-6 inline-flex items-center gap-1.5 text-sm text-terracotta-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Блог руу буцах
      </Link>

      {post.coverImageUrl && (
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="mb-6 w-full rounded-2xl object-cover max-h-72"
        />
      )}

      <h1 className="mb-3 text-2xl font-bold text-stone-800">{post.title}</h1>

      <div className="mb-6 flex items-center gap-1.5 text-sm text-stone-400">
        <Calendar className="h-4 w-4" />
        {formatDate(post.publishedAt ?? post.createdAt)}
      </div>

      {post.excerpt && (
        <p className="mb-6 text-base text-stone-600 italic border-l-2 border-terracotta-300 pl-4">
          {post.excerpt}
        </p>
      )}

      <div
        className="prose prose-stone max-w-none prose-headings:text-stone-800 prose-a:text-terracotta-600"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    </article>
  );
}
