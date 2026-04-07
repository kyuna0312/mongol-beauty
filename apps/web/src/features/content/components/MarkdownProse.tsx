import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';
import type { Components } from 'react-markdown';

interface MarkdownProseProps {
  markdown: string;
  className?: string;
}

const markdownComponents: Components = {
  a: ({ href, children, className, ...rest }) => {
    if (!href) {
      return <span className={className}>{children}</span>;
    }
    const isInternal = href.startsWith('/') && !href.startsWith('//');
    const base =
      'text-primary-600 underline underline-offset-[3px] decoration-primary-300/50 transition-colors hover:text-primary-700 hover:decoration-primary-400';
    if (isInternal) {
      return (
        <Link to={href} className={`${base} ${className ?? ''}`}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        className={`${base} ${className ?? ''}`}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="my-5 rounded-r-2xl border-l-[3px] border-violet-200/90 bg-gradient-to-r from-violet-50/80 to-transparent py-3 pl-4 pr-2 text-stone-600 italic shadow-sm shadow-violet-100/30">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded-md bg-rose-50/95 px-1.5 py-0.5 font-mono text-[0.9em] text-stone-800 ring-1 ring-rose-100/80"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-5 overflow-x-auto rounded-2xl border border-rose-100/90 bg-gradient-to-b from-stone-50 to-white p-4 text-sm shadow-inner shadow-rose-50/50">
      {children}
    </pre>
  ),
};

/**
 * Markdown body with GFM, internal `Link` routing, and prose tuned for soft UI.
 * Base typography lives in `.mb-markdown` (tokens.css); this adds component-level polish.
 */
export function MarkdownProse({ markdown, className = '' }: MarkdownProseProps) {
  return (
    <div
      data-markdown-prose
      className={`mb-markdown max-w-none text-stone-700 leading-relaxed ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
