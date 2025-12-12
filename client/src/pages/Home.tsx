import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Grid3X3, List, ArrowUpDown, Loader2 } from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import FilterSidebar, { type FilterState } from '@/components/FilterSidebar';
import SupplierCard from '@/components/SupplierCard';
import CompareBar from '@/components/CompareBar';
import QuickViewModal from '@/components/QuickViewModal';
import ComparisonTable from '@/components/ComparisonTable';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/GlassCard';
import { useSuppliers, type Supplier } from '@/hooks/useSuppliers';

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
  const [page, setPage] = useState(1);

  // Convert FilterState to API filter format
  const apiFilters = useMemo(() => ({
    productType: filters.productTypes[0] as 'raw' | 'compound' | 'processed' | undefined,
    purityLevel: filters.purityLevels[0] as '99' | '99.5' | '99.9' | undefined,
    verificationTier: filters.verificationTiers[0] as 'gold' | 'silver' | 'bronze' | undefined,
    location: filters.locations[0],
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    search: searchQuery || undefined,
    sortBy,
    page,
    limit: 20,
  }), [filters, searchQuery, sortBy, page]);

  // Fetch suppliers from API
  const { data: suppliersData, isLoading, error } = useSuppliers(apiFilters);

  const filteredSuppliers = suppliersData?.data || [];
  const totalSuppliers = suppliersData?.pagination.total || 0;

  // Get compare suppliers from fetched data
  const compareSuppliers = useMemo(
    () => filteredSuppliers.filter((s) => compareIds.includes(s.id)),
    [filteredSuppliers, compareIds]
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

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 px-4 py-1.5 text-xs font-bold tracking-luxury uppercase bg-gold/10 text-gold border-gold/30">
            Exclusive Listings
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-4">Featured Partners</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover verified lithium suppliers from around the world
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-28">
              <GlassCard variant="elevated">
                <GlassCardContent className="p-4">
                  <FilterSidebar
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearAll={() => setFilters(defaultFilters)}
                  />
                </GlassCardContent>
              </GlassCard>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="lg:hidden border-white/10 hover:border-gold/30" 
                      data-testid="button-mobile-filters"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-4 glass-panel border-white/10">
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
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <>
                      <span className="font-serif font-bold text-foreground">{totalSuppliers}</span> partners found
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10" data-testid="select-sort">
                    <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/10">
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Most Established</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex glass-card rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={viewMode === 'grid' ? 'bg-gold/10 text-gold' : ''}
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className={viewMode === 'list' ? 'bg-gold/10 text-gold' : ''}
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <GlassCard variant="elevated" className="text-center py-16">
                <GlassCardContent>
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gold" />
                  <p className="text-lg text-muted-foreground">Loading suppliers...</p>
                </GlassCardContent>
              </GlassCard>
            ) : error ? (
              <GlassCard variant="elevated" className="text-center py-16">
                <GlassCardContent>
                  <p className="text-lg text-destructive mb-4">
                    Failed to load suppliers. Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                    className="border-white/10 hover:border-gold/30"
                  >
                    Retry
                  </Button>
                </GlassCardContent>
              </GlassCard>
            ) : filteredSuppliers.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {filteredSuppliers.map((supplier, index) => (
                    <div 
                      key={supplier.id} 
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <SupplierCard
                        supplier={supplier as any}
                        isSelected={compareIds.includes(supplier.id)}
                        onCompareToggle={handleCompareToggle}
                        onQuickView={(s) => setQuickViewSupplier(s as any)}
                      />
                    </div>
                  ))}
                </div>
                {suppliersData && suppliersData.pagination.totalPages > page && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => p + 1)}
                      className="border-white/10 hover:border-gold/30"
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <GlassCard variant="elevated" className="text-center py-16">
                <GlassCardContent>
                  <p className="text-lg text-muted-foreground mb-4">
                    No partners match your criteria
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters(defaultFilters);
                      setSearchQuery('');
                      setPage(1);
                    }}
                    className="border-white/10 hover:border-gold/30"
                  >
                    Clear All Filters
                  </Button>
                </GlassCardContent>
              </GlassCard>
            )}
          </main>
        </div>
      </div>

      <CompareBar
        suppliers={compareSuppliers as any}
        onRemove={(id) => setCompareIds((prev) => prev.filter((i) => i !== id))}
        onCompare={() => setShowComparison(true)}
        onClear={() => setCompareIds([])}
      />

      <QuickViewModal
        supplier={quickViewSupplier as any}
        open={!!quickViewSupplier}
        onClose={() => setQuickViewSupplier(null)}
      />

      <ComparisonTable
        suppliers={compareSuppliers as any}
        open={showComparison}
        onClose={() => setShowComparison(false)}
      />
    </div>
  );
}
