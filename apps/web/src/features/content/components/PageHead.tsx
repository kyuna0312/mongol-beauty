import { Helmet } from 'react-helmet-async';
import { buildDocumentTitle, buildMetaDescription } from '../lib/page-seo';

interface PageHeadProps {
  pageTitle: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentMarkdown: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  preloadImages?: Array<{
    href: string;
    srcSet?: string;
    sizes?: string;
  }>;
}

export function PageHead({
  pageTitle,
  metaTitle,
  metaDescription,
  contentMarkdown,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  preloadImages = [],
}: PageHeadProps) {
  const title = buildDocumentTitle(pageTitle, metaTitle);
  const description = buildMetaDescription(metaDescription, contentMarkdown);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {preloadImages.map((image) => (
        <link
          key={`${image.href}-${image.sizes || 'default'}`}
          rel="preload"
          as="image"
          href={image.href}
          imageSrcSet={image.srcSet}
          imageSizes={image.sizes}
        />
      ))}
    </Helmet>
  );
}
