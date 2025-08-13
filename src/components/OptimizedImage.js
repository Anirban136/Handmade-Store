import React, { useState, useCallback } from 'react';
import { FaSpinner } from 'react-icons/fa';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackSrc = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
  ...props 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    if (imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  }, [imageSrc, fallbackSrc]);

  return (
    <div className={`image-container ${className}`}>
      {isLoading && (
        <div className="image-placeholder">
          <FaSpinner className="spinner" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`optimized-image ${isLoading ? 'loading' : 'loaded'} ${hasError ? 'error' : ''}`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default OptimizedImage; 