import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import StarRating from './StarRating';
import type { Supplier } from '@/data/suppliers';
import { useState } from 'react';

interface SimilarSuppliersProps {
  suppliers: Supplier[];
  currentSupplierId?: string;
}

export default function SimilarSuppliers({ suppliers, currentSupplierId }: SimilarSuppliersProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  
  const filteredSuppliers = suppliers.filter(s => s.id !== currentSupplierId).slice(0, 6);
  const visibleCount = 3;
  const maxScroll = Math.max(0, filteredSuppliers.length - visibleCount);

  const handlePrev = () => {
    setScrollIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setScrollIndex(prev => Math.min(maxScroll, prev + 1));
  };

  if (filteredSuppliers.length === 0) return null;

  return (
    <div className="space-y-4" data-testid="similar-suppliers">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Similar Suppliers</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            disabled={scrollIndex === 0}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={scrollIndex >= maxScroll}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-300"
          style={{ transform: `translateX(-${scrollIndex * (100 / visibleCount + 4)}%)` }}
        >
          {filteredSuppliers.map((supplier) => (
            <Card
              key={supplier.id}
              className="flex-shrink-0 w-[calc(33.333%-1rem)] min-w-[250px] hover-elevate"
              data-testid={`card-similar-${supplier.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{supplier.name}</p>
                      <VerificationBadge tier={supplier.verificationTier} size="sm" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{supplier.country}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={supplier.rating} showCount={false} size="sm" />
                  <span className="font-bold text-sm">
                    ${supplier.pricePerUnit.toLocaleString()}/MT
                  </span>
                </div>

                <Link href={`/supplier/${supplier.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
