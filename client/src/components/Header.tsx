import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Menu, X, ChevronDown, Moon, Sun, Zap } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({ theme, onThemeToggle }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { label: 'Suppliers', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Compare', href: '/compare' },
    { label: 'Telebuy', href: '/telebuy' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                  <Zap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-semibold text-foreground hidden sm:block">
                  LithiumBuy
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? 'secondary' : 'ghost'}
                  size="sm"
                  data-testid={`nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" data-testid="nav-resources">
                  Resources <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="menu-pricing">Pricing Guide</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-certifications">Certifications</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-api">API Access</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden lg:flex flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9"
                data-testid="input-header-search"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-2">
              <Button variant="outline" size="sm" data-testid="button-signin">
                Sign In
              </Button>
              <Button
                size="sm"
                className="bg-cta text-cta-foreground border-cta"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search suppliers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-mobile-search"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${link.label.toLowerCase()}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
            <div className="flex gap-2 mt-4 sm:hidden">
              <Button variant="outline" className="flex-1" data-testid="mobile-signin">
                Sign In
              </Button>
              <Button className="flex-1 bg-cta text-cta-foreground" data-testid="mobile-get-started">
                Get Started
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
