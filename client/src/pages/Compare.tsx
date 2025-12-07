import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, ArrowRight, X } from 'lucide-react';
import VerificationBadge from '@/components/VerificationBadge';
import StarRating from '@/components/StarRating';
import ComparisonTable from '@/components/ComparisonTable';
import { suppliers, type Supplier } from '@/data/suppliers';

export default function Compare() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const selectedSuppliers = suppliers.filter((s) => selectedIds.includes(s.id));

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-compare">
      {/* Seamless blend from header */}
      <div className="bg-primary text-primary-foreground py-12 relative">
        <div 
          className="absolute inset-0 top-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(28, 25, 23, 0.9) 0%, rgba(28, 25, 23, 0.88) 30%, rgba(28, 25, 23, 0.75) 70%, transparent 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="text-3xl font-bold mb-2">Compare Suppliers</h1>
          <p className="text-primary-foreground/80">
            Select up to 4 suppliers to compare side-by-side
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Available Suppliers</h2>
              <Badge variant="secondary">
                {selectedIds.length}/4 selected
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {suppliers.map((supplier) => {
                const isSelected = selectedIds.includes(supplier.id);
                return (
                  <Card
                    key={supplier.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => toggleSelection(supplier.id)}
                    data-testid={`card-compare-select-${supplier.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(supplier.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium truncate">{supplier.name}</span>
                            <VerificationBadge tier={supplier.verificationTier} size="sm" />
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{supplier.location}, {supplier.country}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <StarRating rating={supplier.rating} showCount={false} size="sm" />
                            <span className="font-bold">
                              ${supplier.pricePerUnit.toLocaleString()}/MT
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          <div className="lg:w-80">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Selected Suppliers</CardTitle>
                  <CardDescription>
                    {selectedIds.length === 0
                      ? 'Select suppliers to compare'
                      : `${selectedIds.length} supplier${selectedIds.length > 1 ? 's' : ''} selected`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedSuppliers.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {selectedSuppliers.map((supplier) => (
                        <div
                          key={supplier.id}
                          className="flex items-center justify-between p-2 rounded bg-muted/50"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">
                                {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                            <span className="text-sm font-medium truncate max-w-32">
                              {supplier.name}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(supplier.id);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Click on suppliers to add them to your comparison
                    </p>
                  )}

                  <Button
                    className="w-full bg-cta text-cta-foreground"
                    disabled={selectedIds.length < 2}
                    onClick={() => setShowComparison(true)}
                    data-testid="button-view-comparison"
                  >
                    Compare {selectedIds.length} Suppliers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {selectedIds.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full mt-2"
                      onClick={() => setSelectedIds([])}
                    >
                      Clear Selection
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <ComparisonTable
        suppliers={selectedSuppliers}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
}
