import { Link } from 'wouter';
import { Diamond } from 'lucide-react';
import { SiLinkedin, SiX, SiGithub } from 'react-icons/si';

const footerLinks = {
  directory: [
    { label: 'Mining Companies', href: '/mining' },
    { label: 'Refining Technology', href: '/refining' },
    { label: 'Battery Manufacturers', href: '/battery' },
    { label: 'Investment Firms', href: '/investment' },
  ],
  resources: [
    { label: 'Market Analysis', href: '/market' },
    { label: 'Sustainability Reports', href: '/sustainability' },
    { label: 'AI Studio Guide', href: '/ai-studio' },
    { label: 'API Access', href: '/api' },
  ],
  connect: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 pt-20 pb-10 transition-colors duration-500" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1">
            <Link href="/">
              <div className="flex items-center space-x-2 mb-6 cursor-pointer group">
                <Diamond className="h-5 w-5 text-gold" />
                <span className="text-lg font-serif font-bold tracking-wider text-stone-900 dark:text-stone-100">
                  LITHIUM <span className="text-gold">&</span> LUX
                </span>
              </div>
            </Link>
            <p className="text-stone-500 dark:text-stone-400 text-sm leading-relaxed mb-6">
              The premier digital destination for the lithium industry's most influential players. Connecting capital, technology, and resources.
            </p>
            <div className="text-sm text-stone-400 dark:text-stone-500">
              <p>New York • London • Perth</p>
            </div>
          </div>
          
          <div>
            <h4 className="text-stone-900 dark:text-stone-200 font-serif mb-6">Directory</h4>
            <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
              {footerLinks.directory.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="hover:text-gold cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-stone-900 dark:text-stone-200 font-serif mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="hover:text-gold cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-stone-900 dark:text-stone-200 font-serif mb-6">Connect</h4>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-stone-400 hover:text-gold transition-colors" data-testid="link-twitter">
                <SiX className="h-5 w-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-gold transition-colors" data-testid="link-linkedin">
                <SiLinkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-stone-400 hover:text-gold transition-colors" data-testid="link-github">
                <SiGithub className="h-5 w-5" />
              </a>
            </div>
            <ul className="space-y-3 text-sm text-stone-500 dark:text-stone-400">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="hover:text-gold cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200 dark:border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500 dark:text-stone-500">
          <p>&copy; {new Date().getFullYear()} Lithium & Lux. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy">
              <span className="hover:text-gold cursor-pointer transition-colors">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="hover:text-gold cursor-pointer transition-colors">Terms of Service</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
