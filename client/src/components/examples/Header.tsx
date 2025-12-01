import { useState } from 'react';
import Header from '../Header';

export default function HeaderExample() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  return (
    <Header 
      theme={theme} 
      onThemeToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
    />
  );
}
