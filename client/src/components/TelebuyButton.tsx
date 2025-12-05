import { useState } from 'react';
import { useCreateTelebuySession } from '@/hooks/useTelebuy';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';

interface TelebuyButtonProps {
  supplierId: string;
  supplierName: string;
}

export function TelebuyButton({ supplierId, supplierName }: TelebuyButtonProps) {
  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const { data: user } = useAuth();
  const createSession = useCreateTelebuySession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledAt) return;

    try {
      await createSession.mutateAsync({
        supplier_id: supplierId,
        scheduled_at: new Date(scheduledAt).toISOString(),
      });
      setOpen(false);
      // Navigate to session or show success
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" className="w-full">
          <Video className="mr-2 h-4 w-4" />
          Sign in to Start Telebuy
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gold hover:bg-gold/90">
          <Video className="mr-2 h-4 w-4" />
          Start Telebuy
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Telebuy Session</DialogTitle>
          <DialogDescription>
            Schedule a video call with {supplierName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Date & Time</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              disabled={createSession.isPending}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={createSession.isPending || !scheduledAt}
          >
            {createSession.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating session...
              </>
            ) : (
              'Create Session'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}



