import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Battery, Cpu, Rocket, Car, Gem, Zap } from 'lucide-react';
import { Link } from 'wouter';
import heroImage from '@assets/Firefly_Gemini Flash_Create an element enhancement of LI showing a premium luxury for a periodic table sty 148015_1764621878057.png';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

interface ApplicationCard {
  icon: typeof Battery;
  title: string;
  subtitle: string;
  delay: number;
}

const applicationCards: ApplicationCard[] = [
  { icon: Battery, title: 'Energy Storage', subtitle: 'High-Capacity Cells', delay: 0 },
  { icon: Gem, title: 'Sustainable Fashion', subtitle: 'Wearable Tech', delay: 100 },
  { icon: Cpu, title: 'Next-Gen Electronics', subtitle: 'Quantum Computing', delay: 200 },
  { icon: Zap, title: 'Holographic Display', subtitle: 'Autonomous Systems', delay: 300 },
  { icon: Rocket, title: 'Space Exploration', subtitle: 'Interstellar Travel', delay: 400 },
  { icon: Car, title: 'Smart Mobility', subtitle: 'Autonomous Driving', delay: 500 },
];

function FlipCard({ card, index }: { card: ApplicationCard; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = card.icon;

  return (
    <div 
      className="perspective-1000 h-32 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ animationDelay: `${card.delay}ms` }}
    >
      <div 
        className={`relative w-full h-full transition-all duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <div 
          className="absolute inset-0 backface-hidden rounded-xl bg-stone-900/80 backdrop-blur-sm border border-stone-700/50 p-4 flex flex-col justify-center items-center gap-2 hover:border-gold/50 transition-colors"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-stone-700 to-stone-800">
            <Icon className="h-6 w-6 text-stone-300" />
          </div>
          <h3 className="text-sm font-semibold text-white text-center">{card.title}</h3>
          <p className="text-xs text-stone-400 text-center">{card.subtitle}</p>
        </div>
        
        <div 
          className="absolute inset-0 backface-hidden rounded-xl bg-gradient-to-br from-gold/90 to-gold/70 p-4 flex flex-col justify-center items-center gap-2"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Icon className="h-8 w-8 text-stone-900" />
          <p className="text-sm font-bold text-stone-900 text-center">Premium Grade</p>
          <p className="text-xs text-stone-800 text-center">$1M+ Transactions</p>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950" data-testid="hero-section">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Lithium element with premium applications" 
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-transparent to-stone-950" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-bold tracking-widest uppercase text-gold">Enterprise Marketplace</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-fade-in animation-delay-100">
              Acquire{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-amber-300 to-gold">Premium</span>
              <br />Lithium Assets
            </h1>
            
            <p className="text-lg text-stone-300 mb-10 max-w-lg font-light leading-relaxed animate-fade-in animation-delay-200">
              Connect with verified tier-1 suppliers for million-dollar lithium transactions. 
              Enterprise-grade sourcing for the world's most demanding applications.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in animation-delay-300">
              <Button
                size="lg"
                className="h-14 px-10 font-semibold bg-gold text-stone-900 hover:bg-gold/90 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-1 transition-all duration-500"
                onClick={() => onSearch?.('')}
                data-testid="button-hero-search"
              >
                Start Sourcing
              </Button>
              <Link href="/ai-studio">
                <Button 
                  variant="outline"
                  size="lg"
                  className="h-14 px-10 border-stone-600 text-stone-200 hover:bg-stone-800 hover:border-gold/50 hover:-translate-y-1 transition-all duration-500"
                  data-testid="button-ai-studio"
                >
                  AI Studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start animate-fade-in animation-delay-400">
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-gold">$2.4B+</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Transaction Volume</p>
              </div>
              <div className="w-px h-12 bg-stone-700" />
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-gold">147</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Verified Suppliers</p>
              </div>
              <div className="w-px h-12 bg-stone-700" />
              <div className="text-center">
                <p className="text-3xl font-serif font-bold text-gold">99.9%</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider">Purity Grade</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {applicationCards.map((card, index) => (
                <div 
                  key={card.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${600 + card.delay}ms` }}
                >
                  <FlipCard card={card} index={index} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-stone-950 to-transparent pointer-events-none" />
    </section>
  );
}
