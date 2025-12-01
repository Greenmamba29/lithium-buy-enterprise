import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Diamond, Shield, Lock, CreditCard, Globe, Sparkles } from 'lucide-react';
import { SiLinkedin, SiX } from 'react-icons/si';

const footerLinks = {
  marketplace: [
    { label: 'Directory', href: '/' },
    { label: 'Compare', href: '/compare' },
    { label: 'Telebuy', href: '/telebuy' },
    { label: 'Request Quote', href: '/quote' },
  ],
  resources: [
    { label: 'AI Studio', href: '/ai-studio' },
    { label: 'Market Data', href: '/market' },
    { label: 'API Access', href: '/api' },
    { label: 'Reports', href: '/reports' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Compliance', href: '/compliance' },
  ],
};

const trustBadges = [
  { icon: Shield, label: 'Verified Partners' },
  { icon: Lock, label: 'Secure Transactions' },
  { icon: CreditCard, label: 'Protected Payments' },
  { icon: Globe, label: 'Global Network' },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden" data-testid="footer">
      <div className="absolute inset-0 hero-gradient" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <div className="flex items-center gap-2.5 cursor-pointer group mb-6">
                <Diamond className="h-6 w-6 text-gold transition-transform duration-500 group-hover:rotate-180" />
                <span className="text-xl font-serif font-bold tracking-wider">
                  <span className="text-foreground">LITHIUM</span>
                  <span className="text-gold mx-1">&</span>
                  <span className="text-foreground">LUX</span>
                </span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              The world's most exclusive lithium marketplace for enterprise partners.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-10 w-10 rounded-lg glass-card flex items-center justify-center hover:border-gold/30 transition-all"
                data-testid="link-linkedin"
              >
                <SiLinkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg glass-card flex items-center justify-center hover:border-gold/30 transition-all"
                data-testid="link-twitter"
              >
                <SiX className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-luxury uppercase text-gold mb-4">Directory</h4>
            <ul className="space-y-3">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-luxury uppercase text-gold mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors flex items-center gap-1.5">
                      {link.label}
                      {link.label === 'AI Studio' && <Sparkles className="h-3 w-3 text-gold" />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-luxury uppercase text-gold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-luxury uppercase text-gold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-white/10 mb-8" />

        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <badge.icon className="h-5 w-5 text-gold/70" />
              <span className="text-sm">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Lithium & Lux. All rights reserved.</p>
          <p className="mt-1 text-xs opacity-70">Enterprise lithium marketplace for verified global partners.</p>
        </div>
      </div>
    </footer>
  );
}
