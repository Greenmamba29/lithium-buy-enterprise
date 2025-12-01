import StarRating from '../StarRating';

export default function StarRatingExample() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <StarRating rating={4.9} reviewCount={342} size="lg" />
      <StarRating rating={4.5} reviewCount={198} size="md" />
      <StarRating rating={3.8} reviewCount={45} size="sm" />
    </div>
  );
}
