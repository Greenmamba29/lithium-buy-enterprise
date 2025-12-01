import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import heroImage from '@assets/generated_images/lithium_mining_hero_background.png';

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
  { icon: Shield, value: '500+', label: 'Verified Suppliers' },
  { icon: Globe, value: '45+', label: 'Countries' },
  { icon: Zap, value: '$2B+', label: 'Transactions' },
];

export default function HeroSection({ onSearch }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
    console.log('Search:', searchQuery);
  };

  const handleQuickFilter = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
    console.log('Quick filter:', value);
  };

  return (
    <section className="relative overflow-hidden" data-testid="hero-section">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 lg:py-28">
        <div className="max-w-3xl">
          <Badge className="mb-4 bg-gold/20 text-gold border-gold/30" data-testid="badge-trusted">
            Trusted by Fortune 500 Companies
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Find Lithium Suppliers & Products
          </h1>
          
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl">
            Connect with verified suppliers worldwide. Compare prices, purity levels, 
            and certifications for your battery manufacturing needs.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by company, product, or specification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-12 pr-4 text-base bg-white/95 border-0 shadow-lg"
                data-testid="input-hero-search"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 bg-cta text-cta-foreground border-cta shadow-lg"
              data-testid="button-hero-search"
            >
              Search Suppliers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 mb-12">
            <span className="text-white/60 text-sm mr-2">Popular:</span>
            {quickFilters.map((filter) => (
              <Badge
                key={filter.value}
                variant="outline"
                className="cursor-pointer border-white/30 text-white/90 bg-white/10 backdrop-blur-sm"
                onClick={() => handleQuickFilter(filter.value)}
                data-testid={`badge-filter-${filter.value}`}
              >
                {filter.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-8 pt-8 border-t border-white/20">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <stat.icon className="h-5 w-5 text-gold" />
                  <span className="text-2xl sm:text-3xl font-bold text-white" data-testid={`stat-${stat.label}`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
