import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { Zap, Shield, Lock, CreditCard, Globe } from 'lucide-react';
import { SiLinkedin, SiX } from 'react-icons/si';

const footerLinks = {
  marketplace: [
    { label: 'Find Suppliers', href: '/' },
    { label: 'Compare Prices', href: '/compare' },
    { label: 'Telebuy', href: '/telebuy' },
    { label: 'Request Quote', href: '/quote' },
  ],
  resources: [
    { label: 'Pricing Guide', href: '/pricing' },
    { label: 'Certifications', href: '/certifications' },
    { label: 'API Documentation', href: '/api' },
    { label: 'Market Reports', href: '/reports' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Compliance', href: '/compliance' },
  ],
};

const trustBadges = [
  { icon: Shield, label: 'Verified Suppliers' },
  { icon: Lock, label: 'Secure Transactions' },
  { icon: CreditCard, label: 'Protected Payments' },
  { icon: Globe, label: 'Global Network' },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground" data-testid="footer">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-semibold">LithiumBuy</span>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/70 mb-4">
              The enterprise marketplace for lithium supply chain professionals.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="h-9 w-9 rounded-md bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                data-testid="link-linkedin"
              >
                <SiLinkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-md bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                data-testid="link-twitter"
              >
                <SiX className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Marketplace</h4>
            <ul className="space-y-2">
              {footerLinks.marketplace.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-primary-foreground/70 hover:text-primary-foreground cursor-pointer">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20 mb-8" />

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 text-primary-foreground/70"
            >
              <badge.icon className="h-5 w-5" />
              <span className="text-sm">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} LithiumBuy. All rights reserved.</p>
          <p className="mt-1">Enterprise lithium marketplace powered by verified suppliers worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
