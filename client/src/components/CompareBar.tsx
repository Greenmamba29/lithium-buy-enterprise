import { Button } from '@/components/ui/button';
import { X, ArrowRight } from 'lucide-react';
import type { Supplier } from '@/data/suppliers';

interface CompareBarProps {
  suppliers: Supplier[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
}

export default function CompareBar({ suppliers, onRemove, onCompare, onClear }: CompareBarProps) {
  if (suppliers.length === 0) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur shadow-lg"
      data-testid="compare-bar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
              Compare ({suppliers.length}/4):
            </span>
            <div className="flex gap-2">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary"
                  data-testid={`compare-item-${supplier.id}`}
                >
                  <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <span className="text-sm font-medium max-w-24 truncate">
                    {supplier.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => onRemove(supplier.id)}
                    data-testid={`button-remove-compare-${supplier.id}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground"
              data-testid="button-clear-compare"
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={onCompare}
              disabled={suppliers.length < 2}
              className="bg-cta text-cta-foreground border-cta"
              data-testid="button-compare-now"
            >
              Compare Now
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
