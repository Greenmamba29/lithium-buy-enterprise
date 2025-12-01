import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import type { ProductType, PurityLevel, VerificationTier } from '@/data/suppliers';

export interface FilterState {
  productTypes: ProductType[];
  purityLevels: PurityLevel[];
  verificationTiers: VerificationTier[];
  priceRange: [number, number];
  locations: string[];
  inStockOnly: boolean;
  bulkDiscountOnly: boolean;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearAll: () => void;
  supplierCounts?: {
    productTypes: Record<ProductType, number>;
    purityLevels: Record<PurityLevel, number>;
    verificationTiers: Record<VerificationTier, number>;
    locations: Record<string, number>;
  };
}

const productTypeOptions: { value: ProductType; label: string }[] = [
  { value: 'raw', label: 'Raw Lithium' },
  { value: 'compound', label: 'Lithium Compounds' },
  { value: 'processed', label: 'Processed Ore' },
];

const purityLevelOptions: { value: PurityLevel; label: string }[] = [
  { value: '99', label: '99% Purity' },
  { value: '99.5', label: '99.5% Purity' },
  { value: '99.9', label: '99.9% Purity (Battery Grade)' },
];

const verificationOptions: { value: VerificationTier; label: string }[] = [
  { value: 'gold', label: 'Gold Verified' },
  { value: 'silver', label: 'Silver Verified' },
  { value: 'bronze', label: 'Bronze Verified' },
];

const locationOptions = ['USA', 'China', 'Australia', 'Chile', 'Argentina', 'Brazil', 'Canada', 'South Korea', 'Austria'];

export default function FilterSidebar({ filters, onFilterChange, onClearAll, supplierCounts }: FilterSidebarProps) {
  const [priceValue, setPriceValue] = useState(filters.priceRange);

  const toggleFilter = <T extends string>(
    key: keyof Pick<FilterState, 'productTypes' | 'purityLevels' | 'verificationTiers' | 'locations'>,
    value: T
  ) => {
    const current = filters[key] as T[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const handlePriceChange = (value: number[]) => {
    setPriceValue([value[0], value[1]]);
  };

  const handlePriceCommit = () => {
    onFilterChange({ ...filters, priceRange: priceValue });
  };

  const activeFilterCount = 
    filters.productTypes.length +
    filters.purityLevels.length +
    filters.verificationTiers.length +
    filters.locations.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.bulkDiscountOnly ? 1 : 0) +
    (filters.priceRange[0] > 60000 || filters.priceRange[1] < 85000 ? 1 : 0);

  return (
    <div className="w-full space-y-4" data-testid="filter-sidebar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-muted-foreground"
          data-testid="button-clear-filters"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border">
          {filters.productTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1 text-xs">
              {productTypeOptions.find(o => o.value === type)?.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('productTypes', type)}
              />
            </Badge>
          ))}
          {filters.purityLevels.map((level) => (
            <Badge key={level} variant="secondary" className="gap-1 text-xs">
              {level}%
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('purityLevels', level)}
              />
            </Badge>
          ))}
          {filters.verificationTiers.map((tier) => (
            <Badge key={tier} variant="secondary" className="gap-1 text-xs capitalize">
              {tier}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => toggleFilter('verificationTiers', tier)}
              />
            </Badge>
          ))}
        </div>
      )}

      <Accordion type="multiple" defaultValue={['product', 'purity', 'verification', 'price']} className="space-y-2">
        <AccordionItem value="product" className="border rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-3" data-testid="filter-product-type">
            Product Type
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            {productTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`product-${option.value}`}
                    checked={filters.productTypes.includes(option.value)}
                    onCheckedChange={() => toggleFilter('productTypes', option.value)}
                    data-testid={`checkbox-product-${option.value}`}
                  />
                  <Label htmlFor={`product-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
                {supplierCounts?.productTypes[option.value] && (
                  <span className="text-xs text-muted-foreground">
                    ({supplierCounts.productTypes[option.value]})
                  </span>
                )}
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="purity" className="border rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-3" data-testid="filter-purity">
            Purity Level
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            {purityLevelOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`purity-${option.value}`}
                    checked={filters.purityLevels.includes(option.value)}
                    onCheckedChange={() => toggleFilter('purityLevels', option.value)}
                    data-testid={`checkbox-purity-${option.value}`}
                  />
                  <Label htmlFor={`purity-${option.value}`} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="verification" className="border rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-3" data-testid="filter-verification">
            Verification Tier
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2">
            {verificationOptions.map((option) => (
              <div key={option.value} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`verification-${option.value}`}
                    checked={filters.verificationTiers.includes(option.value)}
                    onCheckedChange={() => toggleFilter('verificationTiers', option.value)}
                    data-testid={`checkbox-verification-${option.value}`}
                  />
                  <Label htmlFor={`verification-${option.value}`} className="text-sm cursor-pointer capitalize">
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price" className="border rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-3" data-testid="filter-price">
            Price Range (USD/MT)
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-4">
            <div className="px-1">
              <Slider
                value={priceValue}
                min={60000}
                max={85000}
                step={1000}
                onValueChange={handlePriceChange}
                onValueCommit={handlePriceCommit}
                className="w-full"
                data-testid="slider-price-range"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceValue[0].toLocaleString()}</span>
              <span>${priceValue[1].toLocaleString()}</span>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="location" className="border rounded-md px-3">
          <AccordionTrigger className="text-sm font-medium py-3" data-testid="filter-location">
            Location
          </AccordionTrigger>
          <AccordionContent className="pb-3 space-y-2 max-h-48 overflow-y-auto">
            {locationOptions.map((location) => (
              <div key={location} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`location-${location}`}
                    checked={filters.locations.includes(location)}
                    onCheckedChange={() => toggleFilter('locations', location)}
                    data-testid={`checkbox-location-${location}`}
                  />
                  <Label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                    {location}
                  </Label>
                </div>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => onFilterChange({ ...filters, inStockOnly: !!checked })}
            data-testid="checkbox-in-stock"
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">
            In Stock Only
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="bulk-discount"
            checked={filters.bulkDiscountOnly}
            onCheckedChange={(checked) => onFilterChange({ ...filters, bulkDiscountOnly: !!checked })}
            data-testid="checkbox-bulk-discount"
          />
          <Label htmlFor="bulk-discount" className="text-sm cursor-pointer">
            Bulk Discount Available
          </Label>
        </div>
      </div>
    </div>
  );
}
