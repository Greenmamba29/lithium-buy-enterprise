import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Menu, X, ChevronDown, Moon, Sun, Diamond, Sparkles } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({ theme, onThemeToggle }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Directory', href: '/' },
    { label: 'AI Studio', href: '/ai-studio' },
    { label: 'Compare', href: '/compare' },
    { label: 'Telebuy', href: '/telebuy' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass-panel py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center gap-2.5 cursor-pointer group">
                <Diamond className="h-6 w-6 text-gold transition-transform duration-500 group-hover:rotate-180" />
                <span className="text-xl font-serif font-bold tracking-wider">
                  <span className="text-foreground">LITHIUM</span>
                  <span className="text-gold mx-1">&</span>
                  <span className="text-foreground">LUX</span>
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`px-4 py-2 text-xs font-medium tracking-luxury uppercase transition-colors duration-300 ${
                    location === link.href
                      ? 'text-gold border-b border-gold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                  {link.label === 'AI Studio' && (
                    <Sparkles className="inline-block ml-1.5 h-3 w-3 text-gold" />
                  )}
                </button>
              </Link>
            ))}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="px-4 py-2 text-xs font-medium tracking-luxury uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  data-testid="nav-resources"
                >
                  Resources <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-panel border-white/10">
                <DropdownMenuItem data-testid="menu-pricing">Market Data</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-certifications">Certifications</DropdownMenuItem>
                <DropdownMenuItem data-testid="menu-api">API Access</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="hidden xl:flex flex-1 max-w-xs mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 h-9 bg-white/5 border-white/10 focus:border-gold/50 focus:ring-gold/20"
                data-testid="input-header-search"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="text-muted-foreground hover:text-foreground"
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <div className="hidden sm:flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs tracking-luxury uppercase text-muted-foreground hover:text-foreground"
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="text-xs font-bold tracking-luxury uppercase bg-foreground text-background hover:bg-gold hover:text-foreground transition-all duration-300"
                data-testid="button-join-network"
              >
                Join Network
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden glass-panel mt-4 rounded-lg p-4 animate-fade-in">
            <form onSubmit={handleSearch} className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search directory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/5 border-white/10"
                data-testid="input-mobile-search"
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button
                    className={`w-full text-left px-3 py-2.5 text-sm tracking-luxury uppercase transition-colors rounded ${
                      location === link.href
                        ? 'text-gold bg-gold/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
            </nav>
            <div className="flex gap-2 mt-4 sm:hidden">
              <Button variant="outline" className="flex-1 text-xs tracking-luxury uppercase" data-testid="mobile-signin">
                Sign In
              </Button>
              <Button className="flex-1 text-xs tracking-luxury uppercase bg-foreground text-background" data-testid="mobile-join">
                Join Network
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
