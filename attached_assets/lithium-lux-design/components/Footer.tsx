import React from 'react';
import { Diamond, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-obsidian border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <Diamond className="w-5 h-5 text-gold-500" />
              <span className="text-lg font-serif font-bold tracking-wider text-white">
                LITHIUM <span className="text-gold-500">&</span> LUX
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              The premier digital destination for the lithium industry's most influential players. Connecting capital, technology, and resources.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-serif mb-6">Directory</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Mining Companies</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Refining Technology</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Battery Manufacturers</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Investment Firms</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-serif mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Market Analysis</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">Sustainability Reports</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">AI Studio Guide</li>
              <li className="hover:text-gold-500 cursor-pointer transition-colors">API Access</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-serif mb-6">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
            </div>
            <div className="text-sm text-gray-500">
              <p>New York • London • Perth</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2024 Lithium & Lux. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
