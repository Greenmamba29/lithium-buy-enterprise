import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'wouter';
import heroImage from '@assets/Firefly_Gemini Flash_Create a luxury landing page for a lithium brand similar to Apple + Google. This is a 347316_1764620122945.png';

interface HeroSectionProps {
  onSearch?: (query: string) => void;
}

export default function HeroSection({ onSearch }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-stone-100 dark:bg-black" data-testid="hero-section">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage}
          alt="Lithium crystal with prismatic light" 
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-stone-50 dark:to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-black/40" />
        <div className="absolute inset-0 bg-radial-gradient" style={{backgroundImage: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)'}} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full py-32">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight animate-fade-in">
            Discover Premium{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-stone-300">Lithium Sources</span>
          </h1>
          
          <p className="text-xl text-stone-200 mb-10 max-w-xl mx-auto font-light leading-relaxed animate-fade-in animation-delay-100">
            Connect with verified mining enterprises, technology innovators, and investment opportunities worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-200">
            <Button
              size="lg"
              className="h-14 px-8 font-semibold bg-gold text-white hover:bg-gold/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => onSearch?.('')}
              data-testid="button-hero-search"
            >
              Explore Directory
            </Button>
            <Link href="/ai-studio">
              <Button 
                variant="secondary"
                size="lg"
                className="h-14 px-8 bg-stone-800 text-stone-100 hover:bg-stone-700 hover:-translate-y-0.5 transition-all duration-300"
                data-testid="button-ai-studio"
              >
                Try AI Studio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 dark:from-black to-transparent" />
    </section>
  );
}
