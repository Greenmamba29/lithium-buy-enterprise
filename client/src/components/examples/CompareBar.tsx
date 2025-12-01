import CompareBar from '../CompareBar';
import { suppliers } from '@/data/suppliers';

export default function CompareBarExample() {
  const selectedSuppliers = suppliers.slice(0, 3);

  return (
    <div className="h-32 relative">
      <CompareBar
        suppliers={selectedSuppliers}
        onRemove={(id) => console.log('Remove:', id)}
        onCompare={() => console.log('Compare clicked')}
        onClear={() => console.log('Clear clicked')}
      />
    </div>
  );
}
