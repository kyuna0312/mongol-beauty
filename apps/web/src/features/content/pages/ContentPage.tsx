import { useQuery, gql } from '@apollo/client';
import { Navigate } from 'react-router-dom';
import { MarkdownContent } from '../components/MarkdownContent';
import { PageHead } from '../components/PageHead';

const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: String!) {
    page(slug: $slug) {
      id
      slug
      title
      content
      metaTitle
      metaDescription
      updatedAt
    }
  }
`;

interface ContentPageProps {
  slug: 'privacy' | 'shipping' | 'returns' | 'faq' | 'about';
}

export function ContentPage({ slug }: ContentPageProps) {
  const { data, loading, error } = useQuery(GET_PAGE_BY_SLUG, {
    variables: { slug },
    fetchPolicy: 'cache-and-network',
  });

  if (loading) {
    return (
      <div className="mb-page">
        <div className="mb-card-surface p-8 animate-pulse">
          <div className="h-8 w-48 rounded bg-stone-200 mb-4" />
          <div className="h-4 w-full rounded bg-stone-200 mb-2" />
          <div className="h-4 w-11/12 rounded bg-stone-200 mb-2" />
          <div className="h-4 w-10/12 rounded bg-stone-200" />
        </div>
      </div>
    );
  }

  if (error || !data?.page) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mb-page">
      <PageHead
        pageTitle={data.page.title}
        metaTitle={data.page.metaTitle}
        metaDescription={data.page.metaDescription}
        contentMarkdown={data.page.content}
      />
      <article className="mb-card-surface p-6 md:p-8">
        <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-stone-800 mb-4">
          {data.page.title}
        </h1>
        <MarkdownContent markdown={data.page.content} />
      </article>
    </div>
  );
}
