import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center" data-testid="page-not-found">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-primary/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved. 
          Let's get you back to finding lithium suppliers.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button data-testid="button-go-home">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" data-testid="button-search-suppliers">
              <Search className="h-4 w-4 mr-2" />
              Search Suppliers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
