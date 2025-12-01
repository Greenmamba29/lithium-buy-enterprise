import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Shield, Zap, Globe, Sparkles } from 'lucide-react';
import { Link } from 'wouter';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

const quickFilters = [
  { label: 'Battery Grade', value: 'battery-grade' },
  { label: '99.9% Purity', value: '99.9' },
  { label: 'Gold Verified', value: 'gold' },
  { label: 'USA Suppliers', value: 'usa' },
];

const stats = [
  { icon: Shield, value: '500+', label: 'Verified Partners' },
  { icon: Globe, value: '45+', label: 'Countries' },
  { icon: Zap, value: '$2B+', label: 'Transactions' },
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleQuickFilter = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <div className="absolute inset-0 hero-gradient" />
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-professional-blue/10 rounded-full blur-3xl animate-float animation-delay-300" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-32 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge 
            className="mb-6 px-4 py-1.5 text-xs font-bold tracking-luxury uppercase bg-gold/10 text-gold border-gold/30 animate-fade-in"
            data-testid="badge-trusted"
          >
            The Global Standard
          </Badge>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-tight animate-fade-in animation-delay-100">
            <span className="text-foreground">Curating the Future of</span>
            <br />
            <span className="gold-gradient-text text-shadow-luxury">Lithium</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-fade-in animation-delay-200">
            Discover the world's most exclusive lithium mining enterprises, 
            technology innovators, and investment opportunities in one pristine directory.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8 max-w-2xl mx-auto animate-fade-in animation-delay-300">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by company, product, or specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 text-base glass-panel border-white/10 focus:border-gold/50 focus:ring-gold/20"
                data-testid="input-hero-search"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 font-bold tracking-wide-luxury uppercase bg-foreground text-background hover:bg-gold hover:text-foreground transition-all duration-300"
              data-testid="button-hero-search"
            >
              Explore Directory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in animation-delay-400">
            <Link href="/ai-studio">
              <Button 
                variant="outline" 
                size="lg"
                className="h-12 px-6 border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300"
                data-testid="button-ai-studio"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Try AI Studio
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-16 animate-fade-in animation-delay-400">
            <span className="text-muted-foreground text-sm mr-2">Popular:</span>
            {quickFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant="outline"
                className="cursor-pointer border-white/20 text-muted-foreground hover:border-gold/40 hover:text-gold bg-white/5 backdrop-blur-sm transition-all duration-300"
                onClick={() => handleQuickFilter(filter.value)}
                data-testid={`badge-filter-${filter.value}`}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-8 sm:gap-12 pt-8 border-t border-white/10 max-w-xl mx-auto animate-fade-in animation-delay-500">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-gold group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-foreground" data-testid={`stat-${stat.label}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground tracking-wide-luxury uppercase">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
