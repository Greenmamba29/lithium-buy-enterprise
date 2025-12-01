import { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Home from '@/pages/Home';
import SupplierDetail from '@/pages/SupplierDetail';
import Telebuy from '@/pages/Telebuy';
import Compare from '@/pages/Compare';
import NotFound from '@/pages/not-found';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/supplier/:id" component={SupplierDetail} />
      <Route path="/telebuy" component={Telebuy} />
      <Route path="/compare" component={Compare} />
      <Route path="/products" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
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
  );
}

export default App;
