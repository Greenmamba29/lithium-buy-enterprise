import VerificationBadge from '../VerificationBadge';

export default function VerificationBadgeExample() {
  return (
    <div className="flex flex-wrap items-center gap-6 p-4">
      <VerificationBadge tier="gold" size="lg" showLabel />
      <VerificationBadge tier="silver" size="lg" showLabel />
      <VerificationBadge tier="bronze" size="lg" showLabel />
    </div>
  );
}
