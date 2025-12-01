import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, Eye, FileText, Package } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import StarRating from './StarRating';
import type { Supplier } from '@/data/suppliers';

interface SupplierCardProps {
  supplier: Supplier;
  isSelected?: boolean;
  onCompareToggle?: (id: string) => void;
  onQuickView?: (supplier: Supplier) => void;
}

const productTypeLabels = {
  raw: 'Raw Lithium',
  compound: 'Compound',
  processed: 'Processed',
};

const availabilityConfig = {
  'in-stock': { label: 'In Stock', className: 'bg-success/10 text-success border-success/20' },
  'limited': { label: 'Limited', className: 'bg-gold/10 text-gold border-gold/20' },
  'contact': { label: 'Contact', className: 'bg-muted text-muted-foreground border-muted' },
};

export default function SupplierCard({ supplier, isSelected, onCompareToggle, onQuickView }: SupplierCardProps) {
  const availability = availabilityConfig[supplier.availability];

  return (
    <Card 
      className="group relative overflow-visible transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover-elevate"
      data-testid={`card-supplier-${supplier.id}`}
    >
      <div className="absolute top-3 left-3 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onCompareToggle?.(supplier.id)}
          className="h-5 w-5 border-2 bg-card"
          data-testid={`checkbox-compare-${supplier.id}`}
        />
      </div>

      <div className="absolute top-3 right-3 z-10">
        <VerificationBadge tier={supplier.verificationTier} size="sm" />
      </div>

      <CardContent className="p-5 pt-12">
        <div className="flex flex-col items-center text-center mb-4">
          <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center mb-3">
            <span className="text-xl font-bold text-primary">
              {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <h3 className="font-semibold text-base line-clamp-1" data-testid={`text-supplier-name-${supplier.id}`}>
            {supplier.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{supplier.location}, {supplier.country}</span>
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} size="sm" />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Price/MT</span>
            <span className="font-bold text-lg" data-testid={`text-price-${supplier.id}`}>
              ${supplier.pricePerUnit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Purity</span>
            <span className="font-medium">{supplier.purityLevel}%</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Response: {supplier.responseTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          <Badge variant="secondary" className="text-xs">
            <Package className="h-3 w-3 mr-1" />
            {productTypeLabels[supplier.productType]}
          </Badge>
          <Badge variant="outline" className={availability.className}>
            {availability.label}
          </Badge>
          {supplier.hasBulkDiscount && (
            <Badge className="bg-gold/15 text-gold border-gold/30 text-xs">
              Bulk Discount
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onQuickView?.(supplier)}
            data-testid={`button-quickview-${supplier.id}`}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Quick View
          </Button>
          <Link href={`/supplier/${supplier.id}`}>
            <Button
              size="sm"
              className="flex-1 bg-cta text-cta-foreground border-cta"
              data-testid={`button-quote-${supplier.id}`}
            >
              <FileText className="h-3.5 w-3.5 mr-1" />
              Quote
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
