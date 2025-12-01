import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';
import { DirectoryItem } from '../types';

const MOCK_DATA: DirectoryItem[] = [
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

export const DirectoryGrid: React.FC = () => {
  return (
    <div className="py-24 bg-obsidian">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div>
            <h3 className="text-gold-500 font-bold tracking-widest uppercase text-xs mb-2">Exclusive Listings</h3>
            <h2 className="text-4xl font-serif text-white">Featured Partners</h2>
          </div>
          <div className="mt-6 md:mt-0 flex gap-4">
            <button className="text-sm text-gray-400 hover:text-white transition-colors">All</button>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">Mining</button>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">Tech</button>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">Investment</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_DATA.map((item) => (
            <div key={item.id} className="group relative bg-white/5 border border-white/5 overflow-hidden hover:border-gold-500/30 transition-all duration-500">
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold tracking-widest text-gold-500 uppercase">{item.category}</span>
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.location}
                  </div>
                </div>
                <h3 className="text-xl font-serif text-white mb-3 group-hover:text-gold-200 transition-colors">{item.name}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                  {item.description}
                </p>
                <button className="flex items-center text-xs font-bold tracking-widest text-white uppercase group-hover:text-gold-500 transition-colors">
                  View Profile <ArrowUpRight className="ml-1 w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
