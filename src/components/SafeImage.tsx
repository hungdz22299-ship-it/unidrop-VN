import { useState } from 'react';
import { ImageOff, LoaderCircle } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fallbackSrc?: string;
}

export function SafeImage({ src, alt, className = '', loading = 'lazy', fallbackSrc = 'https://placehold.co/900x900/png?text=UniDrop' }: SafeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`} role="img" aria-label={alt}>
        <div className="flex flex-col items-center gap-1 text-center text-xs">
          <ImageOff className="h-7 w-7" />
          <span>Không tải được ảnh</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
          <LoaderCircle className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
          else setFailed(true);
        }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
