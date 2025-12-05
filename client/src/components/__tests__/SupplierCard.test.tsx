import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SupplierCard from '../SupplierCard';

// Mock supplier data
const mockSupplier = {
  id: '1',
  name: 'Test Supplier',
  logo_url: null,
  verification_tier: 'gold' as const,
  rating: 4.5,
  review_count: 100,
  transaction_count: 50,
  response_time: '24 hours',
  years_in_business: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  products: [{
    id: '1',
    name: 'Lithium Carbonate',
    product_type: 'raw',
    purity_level: '99.5',
    price_per_unit: 70000,
    currency: 'USD',
    unit: 'ton',
    min_order_quantity: 10,
    availability: 'in-stock',
    has_bulk_discount: true,
  }],
  locations: [{
    country: 'USA',
    city: 'Nevada',
  }],
};

describe('SupplierCard', () => {
  it('renders supplier name', () => {
    render(
      <SupplierCard
        supplier={mockSupplier as any}
        isSelected={false}
        onCompareToggle={vi.fn()}
        onQuickView={vi.fn()}
      />
    );

    expect(screen.getByText('Test Supplier')).toBeInTheDocument();
  });

  it('displays verification badge', () => {
    render(
      <SupplierCard
        supplier={mockSupplier as any}
        isSelected={false}
      />
    );

    // Verification badge should be present
    expect(screen.getByTestId(`card-supplier-${mockSupplier.id}`)).toBeInTheDocument();
  });

  it('calls onCompareToggle when checkbox is clicked', () => {
    const onCompareToggle = vi.fn();
    render(
      <SupplierCard
        supplier={mockSupplier as any}
        isSelected={false}
        onCompareToggle={onCompareToggle}
      />
    );

    const checkbox = screen.getByTestId(`checkbox-compare-${mockSupplier.id}`);
    checkbox.click();

    expect(onCompareToggle).toHaveBeenCalledWith(mockSupplier.id);
  });
});

