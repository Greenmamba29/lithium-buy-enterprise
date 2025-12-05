/**
 * Image optimization utilities
 */

/**
 * Get optimized image URL
 * In production, this would use a CDN or image optimization service
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png';
  }
): string {
  if (!originalUrl) return '';

  // For now, return original URL
  // In production, integrate with:
  // - Cloudinary
  // - Imgix
  // - Next.js Image Optimization
  // - Supabase Storage with transformations

  const { width, height, quality = 80, format = 'webp' } = options || {};

  // Placeholder for image optimization
  // Example: `${CDN_URL}/${originalUrl}?w=${width}&h=${height}&q=${quality}&f=${format}`
  return originalUrl;
}

/**
 * Generate responsive image srcset
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[]
): string {
  return sizes
    .map((size) => `${getOptimizedImageUrl(baseUrl, { width: size })} ${size}w`)
    .join(', ');
}

/**
 * Get responsive image sizes attribute
 */
export function getResponsiveSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
}




