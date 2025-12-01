import { Link } from 'wouter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Clock,
  Building2,
  Award,
  FileText,
  Video,
  ExternalLink,
  Package,
  Shield,
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import StarRating from './StarRating';
import type { Supplier } from '@/data/suppliers';

interface QuickViewModalProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ supplier, open, onClose }: QuickViewModalProps) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-quickview">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">
                {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <DialogTitle className="text-xl" data-testid="text-modal-supplier-name">
                  {supplier.name}
                </DialogTitle>
                <VerificationBadge tier={supplier.verificationTier} size="sm" />
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {supplier.location}, {supplier.country}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                  {supplier.yearsInBusiness} years
                </span>
              </div>
              <div className="mt-2">
                <StarRating rating={supplier.rating} reviewCount={supplier.reviewCount} size="sm" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Price per MT</p>
            <p className="text-2xl font-bold" data-testid="text-modal-price">
              ${supplier.pricePerUnit.toLocaleString()}
            </p>
            {supplier.hasBulkDiscount && (
              <Badge className="mt-2 bg-gold/15 text-gold border-gold/30 text-xs">
                Bulk Discount Available
              </Badge>
            )}
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <p className="text-sm text-muted-foreground mb-1">Response Time</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-success" />
              {supplier.responseTime}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {supplier.transactionCount.toLocaleString()} transactions
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Product Type</span>
                <span className="font-medium capitalize">{supplier.productType}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Purity Level</span>
                <span className="font-medium">{supplier.purityLevel}%</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Min Order</span>
                <span className="font-medium">{supplier.minOrderQuantity} MT</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/30">
                <span className="text-muted-foreground">Availability</span>
                <span className="font-medium capitalize">{supplier.availability.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Certifications
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {supplier.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="text-xs">
                  <Award className="h-3 w-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-1.5">
              {supplier.specialties.map((spec) => (
                <Badge key={spec} variant="secondary" className="text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">{supplier.description}</p>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 bg-cta text-cta-foreground border-cta"
            data-testid="button-modal-quote"
          >
            <FileText className="h-4 w-4 mr-2" />
            Request Quote
          </Button>
          <Button variant="outline" className="flex-1" data-testid="button-modal-telebuy">
            <Video className="h-4 w-4 mr-2" />
            Schedule Telebuy
          </Button>
          <Link href={`/supplier/${supplier.id}`}>
            <Button variant="secondary" className="w-full sm:w-auto" data-testid="button-modal-profile">
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Profile
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
