import React, { useState, useEffect } from 'react';
import { Menu, X, Diamond } from 'lucide-react';

interface NavigationProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeSection, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'directory', label: 'Directory' },
    { id: 'studio', label: 'AI Studio' },
    { id: 'market', label: 'Market Data' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-obsidian/90 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => onNavigate('directory')}>
            <Diamond className="w-6 h-6 text-gold-500 transition-transform duration-500 group-hover:rotate-180" />
            <span className="text-xl font-serif font-bold tracking-wider text-white">
              LITHIUM <span className="text-gold-500">&</span> LUX
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm tracking-widest uppercase transition-colors duration-300 ${
                  activeSection === item.id 
                    ? 'text-gold-500 border-b border-gold-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button className="px-5 py-2 text-xs font-bold tracking-widest text-obsidian bg-white hover:bg-gray-200 transition-colors uppercase">
              Join Network
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-obsidian border-b border-white/10 absolute top-full left-0 right-0 p-4">
          <div className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left text-sm tracking-widest uppercase py-2 ${
                  activeSection === item.id ? 'text-gold-500' : 'text-gray-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
