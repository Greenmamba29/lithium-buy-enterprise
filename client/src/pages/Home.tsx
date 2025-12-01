import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Grid3X3, List, ArrowUpDown } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FilterSidebar, { type FilterState } from '@/components/FilterSidebar';
import SupplierCard from '@/components/SupplierCard';
import CompareBar from '@/components/CompareBar';
import QuickViewModal from '@/components/QuickViewModal';
import ComparisonTable from '@/components/ComparisonTable';
import { suppliers, type Supplier } from '@/data/suppliers';

const defaultFilters: FilterState = {
  productTypes: [],
  purityLevels: [],
  verificationTiers: [],
  priceRange: [60000, 85000],
  locations: [],
  inStockOnly: false,
  bulkDiscountOnly: false,
};

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'newest';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [quickViewSupplier, setQuickViewSupplier] = useState<Supplier | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredSuppliers = useMemo(() => {
    let result = [...suppliers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.country.toLowerCase().includes(query) ||
          s.productType.toLowerCase().includes(query)
      );
    }

    if (filters.productTypes.length > 0) {
      result = result.filter((s) => filters.productTypes.includes(s.productType));
    }

    if (filters.purityLevels.length > 0) {
      result = result.filter((s) => filters.purityLevels.includes(s.purityLevel));
    }

    if (filters.verificationTiers.length > 0) {
      result = result.filter((s) => filters.verificationTiers.includes(s.verificationTier));
    }

    if (filters.locations.length > 0) {
      result = result.filter((s) => filters.locations.includes(s.country));
    }

    result = result.filter(
      (s) =>
        s.pricePerUnit >= filters.priceRange[0] &&
        s.pricePerUnit <= filters.priceRange[1]
    );

    if (filters.inStockOnly) {
      result = result.filter((s) => s.availability === 'in-stock');
    }

    if (filters.bulkDiscountOnly) {
      result = result.filter((s) => s.hasBulkDiscount);
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.pricePerUnit - b.pricePerUnit);
        break;
      case 'price-desc':
        result.sort((a, b) => b.pricePerUnit - a.pricePerUnit);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => b.yearsInBusiness - a.yearsInBusiness);
        break;
    }

    return result;
  }, [filters, sortBy, searchQuery]);

  const compareSuppliers = useMemo(
    () => suppliers.filter((s) => compareIds.includes(s.id)),
    [compareIds]
  );

  const handleCompareToggle = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen bg-background" data-testid="page-home">
      <HeroSection onSearch={handleSearch} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onClearAll={() => setFilters(defaultFilters)}
              />
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden" data-testid="button-mobile-filters">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-4">
                    <FilterSidebar
                      filters={filters}
                      onFilterChange={(f) => {
                        setFilters(f);
                      }}
                      onClearAll={() => setFilters(defaultFilters)}
                    />
                  </SheetContent>
                </Sheet>

                <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                  <strong>{filteredSuppliers.length}</strong> suppliers found
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-44" data-testid="select-sort">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Most Established</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {filteredSuppliers.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredSuppliers.map((supplier) => (
                  <SupplierCard
                    key={supplier.id}
                    supplier={supplier}
                    isSelected={compareIds.includes(supplier.id)}
                    onCompareToggle={handleCompareToggle}
                    onQuickView={setQuickViewSupplier}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No suppliers match your criteria
                </p>
                <Button variant="outline" onClick={() => setFilters(defaultFilters)}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      <CompareBar
        suppliers={compareSuppliers}
        onRemove={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
        onCompare={() => setShowComparison(true)}
        onClear={() => setCompareIds([])}
      />

      <QuickViewModal
        supplier={quickViewSupplier}
        open={!!quickViewSupplier}
        onClose={() => setQuickViewSupplier(null)}
      />

      <ComparisonTable
        suppliers={compareSuppliers}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
}
