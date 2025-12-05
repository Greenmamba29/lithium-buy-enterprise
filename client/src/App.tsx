import { useState, useEffect, lazy, Suspense } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Loader2 } from 'lucide-react';

// Lazy load routes for code splitting
const Home = lazy(() => import('@/pages/Home'));
const SupplierDetail = lazy(() => import('@/pages/SupplierDetail'));
const Telebuy = lazy(() => import('@/pages/Telebuy'));
const Compare = lazy(() => import('@/pages/Compare'));
const AIStudio = lazy(() => import('@/pages/AIStudio'));
const Auctions = lazy(() => import('@/pages/Auctions'));
const AuctionDetail = lazy(() => import('@/pages/AuctionDetail'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const NotFound = lazy(() => import('@/pages/not-found'));

// Loading fallback component
function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-gold" />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/supplier/:id" component={SupplierDetail} />
        <Route path="/telebuy" component={Telebuy} />
        <Route path="/compare" component={Compare} />
        <Route path="/ai-studio" component={AIStudio} />
        <Route path="/auctions" component={Auctions} />
        <Route path="/auctions/:id" component={AuctionDetail} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="flex min-h-screen flex-col">
            <Header theme={theme} onThemeToggle={toggleTheme} />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
