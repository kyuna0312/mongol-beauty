/** Strip common markdown noise for a short meta description fallback. */
export function plainTextExcerptFromMarkdown(markdown: string, maxLen = 160): string {
  const t = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/[#>*_\-~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

export const SITE_NAME = 'Mongol Beauty';

/** Fallback when page has no SEO or extractable body text (matches `index.html` default). */
export const DEFAULT_META_DESCRIPTION = 'Gen Z-д зориулсан гоо сайхны бүтээгдэхүүн';

export function buildDocumentTitle(pageTitle: string, metaTitle?: string | null): string {
  const base = (metaTitle?.trim() || pageTitle).trim();
  return base ? `${base} · ${SITE_NAME}` : SITE_NAME;
}

export function buildMetaDescription(
  metaDescription: string | null | undefined,
  contentMarkdown: string,
): string {
  const m = metaDescription?.trim();
  if (m) return m;
  const excerpt = plainTextExcerptFromMarkdown(contentMarkdown);
  return excerpt || DEFAULT_META_DESCRIPTION;
}
