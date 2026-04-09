import { Link } from 'react-router-dom';

/** Routes for informational / legal pages (each is a separate route + lazy chunk). */
export type InfoPageSlug = 'about' | 'faq' | 'shipping' | 'returns' | 'privacy';

const LINKS: Array<{ slug: InfoPageSlug; label: string; path: string }> = [
  { slug: 'about', label: 'Тухай', path: '/about' },
  { slug: 'faq', label: 'FAQ', path: '/faq' },
  { slug: 'shipping', label: 'Хүргэлт', path: '/shipping' },
  { slug: 'returns', label: 'Буцаалт', path: '/returns' },
  { slug: 'privacy', label: 'Нууцлал', path: '/privacy' },
];

export function InfoPagesNav({ current }: { current: InfoPageSlug }) {
  return (
    <nav
      aria-label="Мэдээллийн хуудсууд"
      className="flex flex-wrap justify-center gap-2 border-t border-primary-100/70 pt-8"
    >
      {LINKS.map(({ slug, label, path }) => {
        const isActive = slug === current;
        return (
          <Link
            key={path}
            to={path}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-primary-500 text-white shadow-md shadow-primary-900/10'
                : 'border border-primary-100/90 bg-white/80 text-stone-600 hover:border-primary-200 hover:bg-primary-50/80 hover:text-primary-700'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
