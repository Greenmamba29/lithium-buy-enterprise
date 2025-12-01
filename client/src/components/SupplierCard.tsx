import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Clock, Eye, ArrowUpRight, Package } from 'lucide-react';
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
    <div 
      className="glass-card-3d group relative rounded-lg overflow-visible p-px"
      data-testid={`card-supplier-${supplier.id}`}
    >
      <div className="absolute top-4 left-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onCompareToggle?.(supplier.id)}
          className="h-5 w-5 border-2 bg-background/80 backdrop-blur-sm border-white/20 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          data-testid={`checkbox-compare-${supplier.id}`}
        />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <VerificationBadge tier={supplier.verificationTier} size="sm" />
      </div>

      <div className="relative p-6 pt-14">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center mb-4 group-hover:shadow-glow-gold transition-all duration-500">
            <span className="text-xl font-serif font-bold text-gold">
              {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </span>
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1 group-hover:text-gold transition-colors duration-300" data-testid={`text-supplier-name-${supplier.id}`}>
            {supplier.name}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <MapPin className="h-3.5 w-3.5" />
            <span>{supplier.location}, {supplier.country}</span>
          </div>
        </div>

        <div className="flex justify-center mb-5">
          <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} size="sm" />
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground tracking-wide-luxury uppercase text-xs">Price/MT</span>
            <span className="font-serif font-bold text-xl gold-gradient-text" data-testid={`text-price-${supplier.id}`}>
              ${supplier.pricePerUnit.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground tracking-wide-luxury uppercase text-xs">Purity</span>
            <span className="font-medium">{supplier.purityLevel}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-success" />
            <span>Response: {supplier.responseTime}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          <Badge variant="secondary" className="text-xs bg-white/5 border-white/10">
            <Package className="h-3 w-3 mr-1" />
            {productTypeLabels[supplier.productType]}
          </Badge>
          <Badge variant="outline" className={`text-xs ${availability.className}`}>
            {availability.label}
          </Badge>
          {supplier.hasBulkDiscount && (
            <Badge className="bg-gold/10 text-gold border-gold/20 text-xs">
              Bulk Discount
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-white/10 hover:border-gold/30 hover:text-gold transition-all duration-300"
            onClick={() => onQuickView?.(supplier)}
            data-testid={`button-quickview-${supplier.id}`}
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            Quick View
          </Button>
          <Link href={`/supplier/${supplier.id}`}>
            <Button
              size="sm"
              className="flex-1 bg-foreground text-background hover:bg-gold hover:text-foreground transition-all duration-300 font-medium"
              data-testid={`button-profile-${supplier.id}`}
            >
              View Profile
              <ArrowUpRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
