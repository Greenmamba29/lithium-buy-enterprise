import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const sizeConfig = {
  sm: { star: 'h-3.5 w-3.5', text: 'text-xs', gap: 'gap-0.5' },
  md: { star: 'h-4 w-4', text: 'text-sm', gap: 'gap-1' },
  lg: { star: 'h-5 w-5', text: 'text-base', gap: 'gap-1' },
};

export default function StarRating({ rating, reviewCount, size = 'md', showCount = true }: StarRatingProps) {
  const sizes = sizeConfig[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={`flex items-center ${sizes.gap}`} data-testid="star-rating">
      <div className={`flex ${sizes.gap}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizes.star} ${
              star <= fullStars
                ? 'fill-gold text-gold'
                : star === fullStars + 1 && hasHalfStar
                ? 'fill-gold/50 text-gold'
                : 'fill-muted text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
      <span className={`font-medium ${sizes.text}`} data-testid="rating-value">
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`text-muted-foreground ${sizes.text}`} data-testid="review-count">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
