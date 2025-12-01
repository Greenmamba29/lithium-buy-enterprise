import { useState } from 'react';
import { Button } from '@/components/ui/button';
import QuickViewModal from '../QuickViewModal';
import { suppliers } from '@/data/suppliers';

export default function QuickViewModalExample() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Quick View</Button>
      <QuickViewModal
        supplier={suppliers[0]}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
