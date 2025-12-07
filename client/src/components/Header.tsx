import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Menu, X, Moon, Sun, Diamond, User, Compass, Sparkles, BarChart3, Info } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export default function Header({ theme, onThemeToggle }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);

  const menuItems = [
    { label: 'Directory', href: '/', icon: Compass },
    { label: 'AI Studio', href: '/ai-studio', icon: Sparkles },
    { label: 'Market Data', href: '/market', icon: BarChart3 },
    { label: 'About', href: '/about', icon: Info },
  ];

  // Keyboard navigation and accessibility
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mobileMenuOpen) return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement> | undefined;

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyDown);
      
      // Focus first menu item when menu opens
      setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <>
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
          data-testid="menu-backdrop"
        />
      )}
      <header 
        className="fixed top-0 left-0 right-0 z-50 bg-stone-900/90 backdrop-blur-md py-4"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" data-testid="link-home">
              <div className="flex items-center space-x-2 cursor-pointer group">
                <Diamond className="h-6 w-6 text-gold transition-transform duration-500 group-hover:rotate-180" />
                <span className="text-xl font-serif font-bold tracking-wider text-white">
                  LITHIUM <span className="text-gold">&</span> LUX
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <button 
                onClick={onThemeToggle}
                className="p-2 text-stone-300 hover:text-gold transition-colors"
                data-testid="button-theme-toggle"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              <Button
                size="sm"
                className="hidden sm:flex px-6 py-2 text-xs font-bold tracking-widest uppercase bg-gold text-stone-900 hover:bg-gold/90 shadow-lg shadow-gold/20 transition-all duration-300"
                data-testid="button-join-network"
              >
                Join Network
              </Button>

              <button 
                ref={menuToggleRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 text-white hover:text-gold transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
                data-testid="button-menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div 
            id="mobile-menu"
            ref={menuRef}
            className="absolute top-full left-0 right-0 bg-stone-950/98 backdrop-blur-xl border-b border-stone-800 animate-fade-in"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <nav className="grid gap-2">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const isFirst = index === 0;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        ref={isFirst ? firstMenuItemRef : null}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 ${
                          location === item.href 
                            ? 'bg-gold/10 text-gold border border-gold/30' 
                            : 'text-stone-300 hover:bg-stone-800/50 hover:text-white'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                        role="menuitem"
                        aria-label={`Navigate to ${item.label}`}
                        data-testid={`menu-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                        <span className="text-sm font-semibold tracking-wide uppercase">{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
                
                <div className="border-t border-stone-800 my-4" />
                
                <Button
                  className="w-full h-12 text-sm font-bold tracking-widest uppercase bg-gold text-stone-900 hover:bg-gold/90"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                  aria-label="Sign up"
                  data-testid="menu-sign-up"
                >
                  <User className="h-4 w-4 mr-2" aria-hidden="true" />
                  Sign Up
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full h-12 text-sm font-bold tracking-widest uppercase border-stone-700 text-stone-300 hover:bg-stone-800"
                  onClick={() => setMobileMenuOpen(false)}
                  role="menuitem"
                  aria-label="Join network"
                  data-testid="menu-join-network"
                >
                  Join Network
                </Button>
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
