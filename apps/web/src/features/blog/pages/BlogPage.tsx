import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { GET_BLOG_POSTS } from '@/graphql/queries';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('mn-MN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function BlogPage() {
  const { data, loading } = useQuery(GET_BLOG_POSTS, { fetchPolicy: 'cache-and-network' });
  const posts: any[] = data?.blogPosts ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-2xl font-bold text-stone-800">Блог</h1>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-stone-100 h-64" />
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <p className="text-stone-500">Блог нийтлэл байхгүй байна.</p>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            {post.coverImageUrl ? (
              <img
                src={post.coverImageUrl}
                alt={post.title}
                className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="h-44 w-full bg-terracotta-50" />
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h2 className="text-base font-semibold text-stone-800 line-clamp-2 group-hover:text-terracotta-600 transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-stone-500 line-clamp-3">{post.excerpt}</p>
              )}
              <div className="mt-auto flex items-center gap-1.5 text-xs text-stone-400">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(post.publishedAt ?? post.createdAt)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
