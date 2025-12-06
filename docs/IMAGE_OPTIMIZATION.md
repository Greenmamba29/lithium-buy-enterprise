# Image Optimization & CDN Strategy

## Overview

This document outlines the image optimization and CDN strategy for LithiumBuy Enterprise platform to ensure fast page loads and optimal user experience.

## Current State

- Images are stored in `attached_assets/` directory (61MB+)
- No image optimization pipeline
- Images served directly from server
- No CDN integration
- No lazy loading implementation

## Optimization Strategy

### 1. Image Format Optimization

#### Recommended Formats
- **WebP**: Primary format for modern browsers (25-35% smaller than JPEG)
- **AVIF**: Next-generation format (50% smaller than JPEG, better quality)
- **JPEG**: Fallback for older browsers
- **PNG**: Only for images requiring transparency

#### Implementation
```typescript
// Image conversion utility
import sharp from 'sharp';

async function optimizeImage(input: Buffer, format: 'webp' | 'avif' | 'jpeg'): Promise<Buffer> {
  return sharp(input)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .toFormat(format, { quality: 85 })
    .toBuffer();
}
```

### 2. Image Sizing Strategy

#### Responsive Images
- **Thumbnail**: 150x150px (supplier logos, product images)
- **Small**: 400x400px (cards, lists)
- **Medium**: 800x800px (detail pages)
- **Large**: 1920x1080px (hero images, full-width)
- **Original**: Keep for download/zoom

#### Implementation
```typescript
// Generate multiple sizes
const sizes = [
  { width: 150, suffix: 'thumb' },
  { width: 400, suffix: 'small' },
  { width: 800, suffix: 'medium' },
  { width: 1920, suffix: 'large' },
];

for (const size of sizes) {
  await sharp(input)
    .resize(size.width, null, { fit: 'inside' })
    .toFormat('webp', { quality: 85 })
    .toFile(`output-${size.suffix}.webp`);
}
```

### 3. CDN Integration

#### Recommended CDN Providers

**Option 1: Cloudflare (Recommended)**
- Free tier available
- Automatic image optimization
- Global edge network
- Easy integration

**Option 2: AWS CloudFront + S3**
- Scalable and reliable
- Requires AWS setup
- Good for high traffic

**Option 3: Vercel/Netlify Image Optimization**
- Built-in if using Vercel/Netlify
- Automatic optimization
- Easy setup

#### Cloudflare Implementation

1. **Setup Cloudflare**
```bash
# Install Cloudflare Images API
npm install @cloudflare/images
```

2. **Upload Images**
```typescript
import { CloudflareImages } from '@cloudflare/images';

const cf = new CloudflareImages({
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_API_TOKEN,
});

async function uploadImage(file: Buffer, filename: string) {
  const result = await cf.upload({
    file,
    metadata: { filename },
  });
  return result.id; // Returns image ID
}
```

3. **Serve Optimized Images**
```typescript
// Cloudflare automatically optimizes based on query params
// https://imagedelivery.net/{account_hash}/{image_id}/{variant}
// Variants: public, thumbnail, small, medium, large
```

#### S3 + CloudFront Implementation

1. **Upload to S3**
```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

async function uploadImage(file: Buffer, key: string) {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: 'image/webp',
    CacheControl: 'max-age=31536000', // 1 year
  }));
  
  return `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
}
```

### 4. Lazy Loading

#### Frontend Implementation
```tsx
// React component with lazy loading
import { useState, useEffect, useRef } from 'react';

function LazyImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="lazy-image-container">
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? 'loaded' : 'loading'}
          loading="lazy"
          {...props}
        />
      )}
      {!isLoaded && <div className="image-placeholder" />}
    </div>
  );
}
```

#### Native Browser Lazy Loading
```html
<!-- Use native lazy loading for better performance -->
<img 
  src="image.webp" 
  alt="Description" 
  loading="lazy"
  decoding="async"
/>
```

### 5. Image Service Integration

#### Create Image Service
```typescript
// server/services/imageService.ts
import sharp from 'sharp';
import { supabaseAdmin } from '../db/client.js';

export interface ImageUploadOptions {
  file: Buffer;
  filename: string;
  folder?: string;
  sizes?: number[];
  formats?: ('webp' | 'avif' | 'jpeg')[];
}

export async function uploadAndOptimizeImage(options: ImageUploadOptions) {
  const { file, filename, folder = 'uploads', sizes = [150, 400, 800], formats = ['webp'] } = options;
  
  const results = [];
  
  // Generate optimized versions
  for (const format of formats) {
    for (const size of sizes) {
      const optimized = await sharp(file)
        .resize(size, size, { fit: 'inside', withoutEnlargement: true })
        .toFormat(format, { quality: 85 })
        .toBuffer();
      
      const key = `${folder}/${filename}-${size}w.${format}`;
      
      // Upload to storage (Supabase Storage or S3)
      const { data, error } = await supabaseAdmin.storage
        .from('images')
        .upload(key, optimized, {
          contentType: `image/${format}`,
          cacheControl: '3600',
        });
      
      if (!error) {
        results.push({
          size,
          format,
          url: data.path,
        });
      }
    }
  }
  
  return results;
}
```

### 6. Supabase Storage Integration

#### Setup Supabase Storage
1. Create storage bucket in Supabase Dashboard
2. Configure public access if needed
3. Set up RLS policies

#### Upload to Supabase Storage
```typescript
import { supabaseAdmin } from '../db/client.js';

async function uploadToSupabase(file: Buffer, path: string) {
  const { data, error } = await supabaseAdmin.storage
    .from('images')
    .upload(path, file, {
      contentType: 'image/webp',
      cacheControl: '3600',
      upsert: false,
    });
  
  if (error) throw error;
  
  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('images')
    .getPublicUrl(path);
  
  return publicUrl;
}
```

### 7. Image Optimization Pipeline

#### Build Script for Image Optimization
```typescript
// scripts/optimize-images.ts
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function optimizeImages() {
  const inputDir = 'attached_assets';
  const outputDir = 'public/images/optimized';
  const files = await readdir(inputDir);
  
  for (const file of files) {
    if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
    
    const inputPath = join(inputDir, file);
    const buffer = await readFile(inputPath);
    const baseName = file.replace(/\.[^/.]+$/, '');
    
    // Generate WebP
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(join(outputDir, `${baseName}.webp`));
    
    // Generate AVIF
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .avif({ quality: 80 })
      .toFile(join(outputDir, `${baseName}.avif`));
  }
}
```

### 8. Performance Best Practices

#### Image Loading Strategy
1. **Above the fold**: Load immediately (no lazy loading)
2. **Below the fold**: Lazy load with intersection observer
3. **Off-screen**: Defer until user scrolls near

#### Caching Strategy
- **CDN Cache**: 1 year for optimized images
- **Browser Cache**: 1 year with cache-control headers
- **Service Worker**: Cache images for offline access

#### Responsive Images with srcset
```html
<picture>
  <source 
    srcset="image-800w.avif 800w, image-1600w.avif 1600w"
    type="image/avif"
  />
  <source 
    srcset="image-800w.webp 800w, image-1600w.webp 1600w"
    type="image/webp"
  />
  <img 
    src="image-800w.jpg" 
    srcset="image-800w.jpg 800w, image-1600w.jpg 1600w"
    alt="Description"
    loading="lazy"
  />
</picture>
```

### 9. Implementation Checklist

- [ ] Install image optimization library (sharp)
- [ ] Set up CDN (Cloudflare or AWS CloudFront)
- [ ] Create image upload service
- [ ] Implement responsive image generation
- [ ] Add lazy loading to React components
- [ ] Migrate existing images to optimized formats
- [ ] Set up Supabase Storage bucket
- [ ] Configure CDN caching rules
- [ ] Add image optimization to build pipeline
- [ ] Monitor image load performance

### 10. Monitoring

#### Key Metrics
- **Image load time**: Target < 1s for above-fold images
- **Total page weight**: Target < 2MB for initial load
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **CLS (Cumulative Layout Shift)**: Target < 0.1

#### Tools
- Google PageSpeed Insights
- WebPageTest
- Chrome DevTools Network tab
- Lighthouse CI

### 11. Migration Plan

1. **Phase 1**: Set up image optimization pipeline
2. **Phase 2**: Migrate high-traffic images first
3. **Phase 3**: Implement lazy loading
4. **Phase 4**: Full CDN integration
5. **Phase 5**: Optimize all existing images

## Dependencies

```json
{
  "dependencies": {
    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@types/sharp": "^0.33.0"
  }
}
```

## Environment Variables

```env
# CDN Configuration
CDN_URL=https://cdn.lithiumbuy.com
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token

# AWS (if using S3/CloudFront)
AWS_REGION=us-east-1
S3_BUCKET_NAME=lithiumbuy-images
CLOUDFRONT_DOMAIN=d1234567890.cloudfront.net

# Supabase Storage
SUPABASE_STORAGE_BUCKET=images
```

