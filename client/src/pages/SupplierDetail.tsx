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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
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
  );
}
