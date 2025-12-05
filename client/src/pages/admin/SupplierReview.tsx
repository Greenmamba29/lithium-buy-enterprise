import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Check, X, Loader2 } from 'lucide-react';

export default function SupplierReview() {
  const queryClient = useQueryClient();

  // Fetch pending suppliers (those needing review)
  const { data: pendingSuppliers, isLoading } = useQuery({
    queryKey: ['admin', 'pending-suppliers'],
    queryFn: async () => {
      // This would fetch suppliers with status 'pending_review'
      // For now, placeholder
      return { data: [] };
    },
  });

  const approveSupplier = useMutation({
    mutationFn: async (supplierId: string) => {
      // Approve supplier endpoint
      const res = await apiRequest('POST', `/api/admin/suppliers/${supplierId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-suppliers'] });
    },
  });

  const rejectSupplier = useMutation({
    mutationFn: async (supplierId: string) => {
      const res = await apiRequest('POST', `/api/admin/suppliers/${supplierId}/reject`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-suppliers'] });
    },
  });

  return (
    <ProtectedRoute requiredRole={['admin']}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Supplier Review</h1>
            <p className="text-muted-foreground">
              Review and approve new supplier submissions
            </p>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
                <p className="text-muted-foreground">Loading suppliers...</p>
              </CardContent>
            </Card>
          ) : (pendingSuppliers?.data || []).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No suppliers pending review</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(pendingSuppliers?.data || []).map((supplier: any) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{supplier.name}</CardTitle>
                        <CardDescription>
                          {supplier.locations?.[0]?.country || 'Unknown location'}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">Pending Review</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveSupplier.mutate(supplier.id)}
                        disabled={approveSupplier.isPending}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectSupplier.mutate(supplier.id)}
                        disabled={rejectSupplier.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}



