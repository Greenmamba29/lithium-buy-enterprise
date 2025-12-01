import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { DirectoryGrid } from './components/DirectoryGrid';
import { ImageEditor } from './components/ImageEditor';
import { Footer } from './components/Footer';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('directory');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    // Smooth scroll handling
    if (sectionId === 'directory') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'studio') {
      document.getElementById('studio-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans selection:bg-gold-500/30 selection:text-white">
      <Navigation 
        activeSection={activeSection} 
        onNavigate={scrollToSection} 
      />
      
      <main>
        <Hero onCtaClick={() => scrollToSection('directory')} />
        
        {/* We keep all components mounted for a seamless single-page feel, using scroll to navigate */}
        <div id="directory-section">
          <DirectoryGrid />
        </div>
        
        <ImageEditor />
      </main>

      <Footer />
    </div>
  );
};

export default App;
