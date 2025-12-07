import { useState } from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

interface DirectoryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  imageUrl: string;
}

const FEATURED_PARTNERS: DirectoryItem[] = [
  {
    id: '1',
    name: 'Apex Lithium',
    category: 'Mining',
    description: 'Sustainable extraction in the Nevada basin, focusing on high-purity battery-grade lithium carbonate.',
    location: 'Nevada, USA',
    imageUrl: 'https://images.unsplash.com/photo-1629814596131-0428d08da47f?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Solid State Resources',
    category: 'Technology',
    description: 'Pioneering solid-state battery electrolytes for the next generation of electric vehicles.',
    location: 'Munich, Germany',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a69022365?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Aurum Energy',
    category: 'Investment',
    description: 'A boutique firm specializing in strategic metals and green energy infrastructure investments.',
    location: 'London, UK',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Ionic Flow Systems',
    category: 'Energy Storage',
    description: 'Grid-scale storage solutions utilizing advanced lithium-ion flow battery technology.',
    location: 'Perth, Australia',
    imageUrl: 'https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Crystal Peak Mining',
    category: 'Mining',
    description: 'Exploring the rich pegmatite deposits of the Canadian Shield with AI-driven surveying.',
    location: 'Quebec, Canada',
    imageUrl: 'https://images.unsplash.com/photo-1595168019018-b2230292723c?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Volt Capital',
    category: 'Investment',
    description: 'Connecting institutional investors with high-growth potential lithium assets worldwide.',
    location: 'New York, USA',
    imageUrl: 'https://images.unsplash.com/photo-1526304640152-d4619684e484?q=80&w=800&auto=format&fit=crop'
  }
];

export default function DirectoryGrid() {
  const [activeFilter, setActiveFilter] = useState('all');
  
  const filteredItems = activeFilter === 'all' 
    ? FEATURED_PARTNERS 
    : FEATURED_PARTNERS.filter(item => item.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="py-24 bg-stone-50 dark:bg-stone-950 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h3 className="text-gold font-bold tracking-widest uppercase text-xs mb-2">Exclusive Listings</h3>
            <h2 className="text-4xl font-serif text-stone-900 dark:text-stone-100 transition-colors">Featured Partners</h2>
          </div>
          <div className="flex gap-4">
            <button 
              className={`text-sm font-medium transition-colors ${activeFilter === 'all' ? 'text-stone-900 dark:text-stone-100 border-b-2 border-gold' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
              onClick={() => setActiveFilter('all')}
              data-testid="filter-all"
            >
              All
            </button>
            <button 
              className={`text-sm font-medium transition-colors ${activeFilter === 'mining' ? 'text-stone-900 dark:text-stone-100 border-b-2 border-gold' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
              onClick={() => setActiveFilter('mining')}
              data-testid="filter-mining"
            >
              Mining
            </button>
            <button 
              className={`text-sm font-medium transition-colors ${activeFilter === 'technology' ? 'text-stone-900 dark:text-stone-100 border-b-2 border-gold' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
              onClick={() => setActiveFilter('technology')}
              data-testid="filter-tech"
            >
              Tech
            </button>
            <button 
              className={`text-sm font-medium transition-colors ${activeFilter === 'investment' ? 'text-stone-900 dark:text-stone-100 border-b-2 border-gold' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-300'}`}
              onClick={() => setActiveFilter('investment')}
              data-testid="filter-investment"
            >
              Investment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden hover:shadow-xl transition-all duration-500 rounded-sm"
              data-testid={`card-partner-${item.id}`}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[10%] group-hover:grayscale-0"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-widest text-gold uppercase">{item.category}</span>
                  <div className="flex items-center text-stone-400 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </div>
                </div>
                <h3 className="text-xl font-serif text-stone-900 dark:text-stone-100 mb-3 group-hover:text-gold transition-colors">
                  {item.name}
                </h3>
                <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {item.description}
                </p>
                <Link href={`/supplier/${item.id}`}>
                  <button className="flex items-center text-xs font-bold tracking-widest text-stone-900 dark:text-stone-300 uppercase group-hover:text-gold transition-colors">
                    View Profile <ArrowUpRight className="ml-1 w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
