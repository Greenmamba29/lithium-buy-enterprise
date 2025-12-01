import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, FileText } from 'lucide-react';
import VerificationBadge from './VerificationBadge';
import StarRating from './StarRating';
import type { Supplier } from '@/data/suppliers';

interface ComparisonTableProps {
  suppliers: Supplier[];
  open: boolean;
  onClose: () => void;
}

interface ComparisonRowProps {
  label: string;
  values: (string | number | boolean | React.ReactNode)[];
  highlight?: 'highest' | 'lowest';
}

function ComparisonRow({ label, values, highlight }: ComparisonRowProps) {
  const numericValues = values.map(v => typeof v === 'number' ? v : null);
  const hasNumeric = numericValues.some(v => v !== null);
  
  let bestIndex = -1;
  if (hasNumeric && highlight) {
    const validValues = numericValues.filter((v): v is number => v !== null);
    if (validValues.length > 0) {
      const target = highlight === 'highest' ? Math.max(...validValues) : Math.min(...validValues);
      bestIndex = numericValues.findIndex(v => v === target);
    }
  }

  return (
    <div className="grid grid-cols-[180px_repeat(4,1fr)] border-b border-border last:border-0">
      <div className="p-3 bg-muted/30 font-medium text-sm">
        {label}
      </div>
      {values.map((value, i) => (
        <div
          key={i}
          className={`p-3 text-sm text-center ${i === bestIndex ? 'bg-success/10' : ''}`}
        >
          {typeof value === 'boolean' ? (
            value ? (
              <Check className="h-4 w-4 text-success mx-auto" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground mx-auto" />
            )
          ) : (
            <span className={i === bestIndex ? 'font-semibold text-success' : ''}>
              {value}
            </span>
          )}
        </div>
      ))}
      {values.length < 4 && Array(4 - values.length).fill(0).map((_, i) => (
        <div key={`empty-${i}`} className="p-3 bg-muted/20" />
      ))}
    </div>
  );
}

export default function ComparisonTable({ suppliers, open, onClose }: ComparisonTableProps) {
  if (suppliers.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]" data-testid="modal-comparison">
        <DialogHeader>
          <DialogTitle>Compare Suppliers ({suppliers.length})</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[180px_repeat(4,1fr)] border-b-2 border-border sticky top-0 bg-card z-10">
              <div className="p-3" />
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="p-3 text-center">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <span className="text-sm font-bold text-primary">
                      {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <p className="font-semibold text-sm mb-1">{supplier.name}</p>
                  <div className="flex justify-center">
                    <VerificationBadge tier={supplier.verificationTier} size="sm" />
                  </div>
                </div>
              ))}
              {suppliers.length < 4 && Array(4 - suppliers.length).fill(0).map((_, i) => (
                <div key={`header-empty-${i}`} className="p-3 bg-muted/20" />
              ))}
            </div>

            <div className="divide-y divide-border">
              <ComparisonRow
                label="Rating"
                values={suppliers.map((s) => (
                  <StarRating key={s.id} rating={s.rating} showCount={false} size="sm" />
                ))}
              />
              <ComparisonRow
                label="Price per MT"
                values={suppliers.map((s) => `$${s.pricePerUnit.toLocaleString()}`)}
              />
              <ComparisonRow
                label="Purity Level"
                values={suppliers.map((s) => `${s.purityLevel}%`)}
              />
              <ComparisonRow
                label="Product Type"
                values={suppliers.map((s) => s.productType.charAt(0).toUpperCase() + s.productType.slice(1))}
              />
              <ComparisonRow
                label="Location"
                values={suppliers.map((s) => `${s.location}, ${s.country}`)}
              />
              <ComparisonRow
                label="Response Time"
                values={suppliers.map((s) => s.responseTime)}
              />
              <ComparisonRow
                label="Years in Business"
                values={suppliers.map((s) => s.yearsInBusiness)}
                highlight="highest"
              />
              <ComparisonRow
                label="Transactions"
                values={suppliers.map((s) => s.transactionCount.toLocaleString())}
                highlight="highest"
              />
              <ComparisonRow
                label="Min Order (MT)"
                values={suppliers.map((s) => s.minOrderQuantity)}
                highlight="lowest"
              />
              <ComparisonRow
                label="Bulk Discount"
                values={suppliers.map((s) => s.hasBulkDiscount)}
              />
              <ComparisonRow
                label="Availability"
                values={suppliers.map((s) => (
                  <Badge
                    key={s.id}
                    variant={s.availability === 'in-stock' ? 'default' : 'secondary'}
                    className={s.availability === 'in-stock' ? 'bg-success/10 text-success' : ''}
                  >
                    {s.availability.replace('-', ' ')}
                  </Badge>
                ))}
              />
              <ComparisonRow
                label="Certifications"
                values={suppliers.map((s) => s.certifications.join(', '))}
              />
            </div>

            <div className="grid grid-cols-[180px_repeat(4,1fr)] border-t-2 border-border mt-4 pt-4">
              <div className="p-3" />
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="p-3 text-center">
                  <Button
                    className="w-full bg-cta text-cta-foreground border-cta"
                    data-testid={`button-select-${supplier.id}`}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Request Quote
                  </Button>
                </div>
              ))}
              {suppliers.length < 4 && Array(4 - suppliers.length).fill(0).map((_, i) => (
                <div key={`footer-empty-${i}`} className="p-3" />
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
