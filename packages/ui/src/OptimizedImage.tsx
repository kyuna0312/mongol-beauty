import { useState, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'tall'; // Reserved for future use
  sizes?: string;
  loading?: 'lazy' | 'eager';
  srcSet?: string;
}

const DEFAULT_RESPONSIVE_WIDTHS = [320, 480, 640, 768, 1024, 1280];

function buildResponsiveSrcSet(baseSrc: string): string | undefined {
  if (!baseSrc || baseSrc.startsWith('/placeholder')) return undefined;

  // For now we only generate responsive variants for same-origin image endpoints.
  // External/CDN URLs should provide `srcSet` directly from callers.
  const isAbsolute = /^https?:\/\//i.test(baseSrc);
  if (isAbsolute) return undefined;

  return DEFAULT_RESPONSIVE_WIDTHS.map((width) => {
    const separator = baseSrc.includes('?') ? '&' : '?';
    return `${baseSrc}${separator}w=${width}&fit=cover&auto=format ${width}w`;
  }).join(', ');
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio: _aspectRatio = 'square', // Reserved for future responsive image sizing
  sizes = '(max-width: 768px) 50vw, 25vw',
  loading = 'lazy',
  srcSet,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const resolvedSrcSet = srcSet || buildResponsiveSrcSet(src);

  const handleError = () => {
    setImageError(true);
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  if (imageError || !src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-2xl">📦</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        loading={loading}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        sizes={sizes}
        srcSet={resolvedSrcSet}
      />
    </div>
  );
});
