import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun, Diamond } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({ theme, onThemeToggle }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { label: 'Market Data', href: '/market' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 py-4 shadow-sm' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2 cursor-pointer group">
              <Diamond className="h-6 w-6 text-gold transition-transform duration-500 group-hover:rotate-180" />
              <span className={`text-xl font-serif font-bold tracking-wider transition-colors ${
                isScrolled 
                  ? 'text-stone-900 dark:text-stone-100' 
                  : 'text-white'
              }`}>
                LITHIUM <span className="text-gold">&</span> LUX
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                    location === link.href
                      ? 'text-gold border-b border-gold'
                      : isScrolled
                        ? 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                        : 'text-stone-300 hover:text-white'
                  }`}
                  data-testid={`nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </button>
              </Link>
            ))}
            
            <button 
              onClick={onThemeToggle}
              className={`p-2 transition-colors ${
                isScrolled 
                  ? 'text-stone-500 hover:text-gold dark:text-stone-400 dark:hover:text-gold' 
                  : 'text-stone-300 hover:text-gold'
              }`}
              data-testid="button-theme-toggle"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Button
              size="sm"
              className="px-5 py-2 text-xs font-bold tracking-widest uppercase bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-gold dark:hover:bg-gold hover:text-white dark:hover:text-white shadow-lg transition-all duration-300"
              data-testid="button-join-network"
            >
              Join Network
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={onThemeToggle}
              className={`p-2 ${isScrolled ? 'text-stone-500 dark:text-stone-400' : 'text-stone-300'}`}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className={isScrolled ? 'text-stone-900 dark:text-stone-100' : 'text-white'}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-stone-900 border-b border-stone-100 dark:border-stone-800 absolute top-full left-0 right-0 p-4 shadow-xl animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <button
                  className={`text-left text-sm tracking-widest uppercase py-2 transition-colors ${
                    location === link.href 
                      ? 'text-gold' 
                      : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`mobile-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </button>
              </Link>
            ))}
            <Button
              size="sm"
              className="mt-2 w-full text-xs font-bold tracking-widest uppercase bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900"
              data-testid="mobile-join"
            >
              Join Network
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
