import React from 'react';
import { Button } from './Button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onCtaClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onCtaClick }) => {
  return (
    <div className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1518544806314-5f817362df58?q=80&w=2070&auto=format&fit=crop"
          alt="Abstract metallic texture" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left w-full">
        <div className="max-w-3xl">
          <h2 className="text-gold-500 tracking-[0.2em] text-sm font-bold uppercase mb-4 animate-fade-in">
            The Global Standard
          </h2>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 leading-tight">
            Curating the Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Lithium</span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-xl font-light leading-relaxed">
            Discover the world's most exclusive lithium mining enterprises, technology innovators, and investment opportunities in one pristine directory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button onClick={onCtaClick}>
              Explore Directory
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' })}>
              Try AI Studio <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
