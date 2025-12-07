import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';
import SupplierProfile from '@/components/SupplierProfile';
import SimilarSuppliers from '@/components/SimilarSuppliers';
import { suppliers, getSupplierById } from '@/data/suppliers';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();
  const supplier = getSupplierById(id || '');

  if (!supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Supplier Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The supplier you're looking for doesn't exist.
          </p>
          <Link href="/">
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Suppliers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="page-supplier-detail">
      {/* Seamless blend from header */}
      <div className="pt-24 pb-8 relative">
        <div 
          className="absolute inset-0 top-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(28, 25, 23, 0.9) 0%, rgba(28, 25, 23, 0.88) 30%, rgba(28, 25, 23, 0.75) 70%, transparent 100%)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <Link href="/">
          <Button variant="ghost" className="mb-6" data-testid="button-back">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Button>
        </Link>

        <SupplierProfile supplier={supplier} />

        <div className="mt-12">
          <SimilarSuppliers
            suppliers={suppliers.filter((s) => s.productType === supplier.productType)}
            currentSupplierId={supplier.id}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
