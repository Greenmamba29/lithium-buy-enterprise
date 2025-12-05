import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DataImports() {
  return (
    <ProtectedRoute requiredRole={['admin']}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Data Imports</h1>
            <p className="text-muted-foreground">
              Manage manual data imports and supplier information
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manual Data Entry</CardTitle>
              <CardDescription>
                Supplier and sourcing data from Accio is entered manually through the supplier management interface.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Use the supplier creation and management tools to manually add and update supplier information
                sourced from Accio reports and other sources.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}



