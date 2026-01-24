import { useState, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'wide' | 'tall'; // Reserved for future use
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio: _aspectRatio = 'square', // Reserved for future responsive image sizing
  sizes = '(max-width: 768px) 50vw, 25vw',
  loading = 'lazy',
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate srcset for responsive images
  const generateSrcSet = (baseSrc: string) => {
    // If it's a placeholder or external URL, return as-is
    if (!baseSrc || baseSrc.startsWith('http') || baseSrc.startsWith('/placeholder')) {
      return undefined;
    }
    // In production, you'd generate multiple sizes
    // For now, return undefined to use single src
    return undefined;
  };

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
        srcSet={generateSrcSet(src)}
      />
    </div>
  );
});
