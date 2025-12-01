import SimilarSuppliers from '../SimilarSuppliers';
import { suppliers } from '@/data/suppliers';

export default function SimilarSuppliersExample() {
  return <SimilarSuppliers suppliers={suppliers} currentSupplierId="1" />;
}
