import SupplierProfile from '../SupplierProfile';
import { suppliers } from '@/data/suppliers';

export default function SupplierProfileExample() {
  return <SupplierProfile supplier={suppliers[0]} />;
}
