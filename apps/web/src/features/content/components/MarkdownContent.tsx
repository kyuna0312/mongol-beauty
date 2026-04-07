import { MarkdownProse } from './MarkdownProse';

interface MarkdownContentProps {
  markdown: string;
  className?: string;
}

export function MarkdownContent({ markdown, className = '' }: MarkdownContentProps) {
  return <MarkdownProse markdown={markdown} className={className} />;
}
