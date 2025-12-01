import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ComparisonTable from '../ComparisonTable';
import { suppliers } from '@/data/suppliers';

export default function ComparisonTableExample() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Comparison</Button>
      <ComparisonTable
        suppliers={suppliers.slice(0, 3)}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
