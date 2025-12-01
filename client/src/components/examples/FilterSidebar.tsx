import { useState } from 'react';
import FilterSidebar, { type FilterState } from '../FilterSidebar';

const defaultFilters: FilterState = {
  productTypes: [],
  purityLevels: [],
  verificationTiers: [],
  priceRange: [60000, 85000],
  locations: [],
  inStockOnly: false,
  bulkDiscountOnly: false,
};

export default function FilterSidebarExample() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  return (
    <div className="max-w-xs">
      <FilterSidebar
        filters={filters}
        onFilterChange={setFilters}
        onClearAll={() => setFilters(defaultFilters)}
      />
    </div>
  );
}
