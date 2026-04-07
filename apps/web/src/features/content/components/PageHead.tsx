import { Helmet } from 'react-helmet-async';
import { buildDocumentTitle, buildMetaDescription } from '../lib/page-seo';

interface PageHeadProps {
  pageTitle: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  contentMarkdown: string;
}

export function PageHead({ pageTitle, metaTitle, metaDescription, contentMarkdown }: PageHeadProps) {
  return (
    <Helmet>
      <title>{buildDocumentTitle(pageTitle, metaTitle)}</title>
      <meta name="description" content={buildMetaDescription(metaDescription, contentMarkdown)} />
    </Helmet>
  );
}
