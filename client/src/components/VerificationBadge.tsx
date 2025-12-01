import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, Award, Medal } from 'lucide-react';
import type { VerificationTier } from '@/data/suppliers';

interface VerificationBadgeProps {
  tier: VerificationTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const tierConfig = {
  gold: {
    icon: Award,
    label: 'Gold Verified',
    description: 'Top-tier supplier with 1000+ transactions, 4.5+ rating, and full certifications',
    bgClass: 'bg-gold/15 dark:bg-gold/20',
    textClass: 'text-gold',
    borderClass: 'border-gold/30',
  },
  silver: {
    icon: Shield,
    label: 'Silver Verified',
    description: 'Established supplier with 500+ transactions and verified certifications',
    bgClass: 'bg-silver/15 dark:bg-silver/20',
    textClass: 'text-silver',
    borderClass: 'border-silver/30',
  },
  bronze: {
    icon: Medal,
    label: 'Bronze Verified',
    description: 'Verified supplier with completed background checks',
    bgClass: 'bg-bronze/15 dark:bg-bronze/20',
    textClass: 'text-bronze',
    borderClass: 'border-bronze/30',
  },
};

const sizeConfig = {
  sm: { container: 'h-6 w-6', icon: 'h-3.5 w-3.5', text: 'text-xs' },
  md: { container: 'h-8 w-8', icon: 'h-4 w-4', text: 'text-sm' },
  lg: { container: 'h-10 w-10', icon: 'h-5 w-5', text: 'text-base' },
};

export default function VerificationBadge({ tier, size = 'md', showLabel = false }: VerificationBadgeProps) {
  const config = tierConfig[tier];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const badge = (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full border ${config.bgClass} ${config.borderClass} ${sizes.container}`}
        data-testid={`badge-verification-${tier}`}
      >
        <Icon className={`${sizes.icon} ${config.textClass}`} />
      </div>
      {showLabel && (
        <span className={`font-medium ${config.textClass} ${sizes.text}`}>
          {config.label}
        </span>
      )}
    </div>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badge}
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
