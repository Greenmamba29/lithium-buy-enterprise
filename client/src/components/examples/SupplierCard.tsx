import { useState } from 'react';
import SupplierCard from '../SupplierCard';
import { suppliers } from '@/data/suppliers';

export default function SupplierCardExample() {
  const [selected, setSelected] = useState<string[]>([]);

  const handleCompareToggle = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-sm">
      <SupplierCard
        supplier={suppliers[0]}
        isSelected={selected.includes(suppliers[0].id)}
        onCompareToggle={handleCompareToggle}
        onQuickView={(s) => console.log('Quick view:', s.name)}
      />
    </div>
  );
}
