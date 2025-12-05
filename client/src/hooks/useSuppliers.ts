import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface SupplierFilters {
  productType?: 'raw' | 'compound' | 'processed';
  purityLevel?: '99' | '99.5' | '99.9';
  verificationTier?: 'gold' | 'silver' | 'bronze';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'rating' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface Supplier {
  id: string;
  name: string;
  logo_url: string | null;
  verification_tier: 'gold' | 'silver' | 'bronze';
  rating: number;
  review_count: number;
  transaction_count: number;
  response_time: string | null;
  years_in_business: number | null;
  created_at: string;
  updated_at: string;
  supplier_profiles?: Array<{
    description: string | null;
    website: string | null;
    contact_email: string | null;
    phone: string | null;
    specialties: string[] | null;
  }>;
  locations?: Array<{
    country: string;
    city: string | null;
    address: string | null;
  }>;
  products?: Array<{
    id: string;
    name: string;
    product_type: string;
    purity_level: string;
    price_per_unit: number;
    currency: string;
    unit: string;
    min_order_quantity: number | null;
    availability: string;
    has_bulk_discount: boolean;
  }>;
  certifications?: Array<{
    certification_type: string;
    certification_number: string | null;
    expiry_date: string | null;
  }>;
}

export interface SuppliersResponse {
  data: Supplier[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Hook to fetch suppliers with filtering and pagination
 */
export function useSuppliers(filters: SupplierFilters = {}) {
  return useQuery<SuppliersResponse>({
    queryKey: ['suppliers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (filters.productType) params.append('productType', filters.productType);
      if (filters.purityLevel) params.append('purityLevel', filters.purityLevel);
      if (filters.verificationTier) params.append('verificationTier', filters.verificationTier);
      if (filters.location) params.append('location', filters.location);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const res = await apiRequest('GET', `/api/suppliers?${params.toString()}`);
      return res.json();
    },
  });
}

/**
 * Hook to fetch a single supplier by ID
 */
export function useSupplier(id: string | undefined) {
  return useQuery<{ data: Supplier }>({
    queryKey: ['supplier', id],
    queryFn: async () => {
      if (!id) throw new Error('Supplier ID is required');
      const res = await apiRequest('GET', `/api/suppliers/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to fetch supplier products
 */
export function useSupplierProducts(supplierId: string | undefined) {
  return useQuery<{ data: any[] }>({
    queryKey: ['supplier-products', supplierId],
    queryFn: async () => {
      if (!supplierId) throw new Error('Supplier ID is required');
      const res = await apiRequest('GET', `/api/suppliers/${supplierId}/products`);
      return res.json();
    },
    enabled: !!supplierId,
  });
}

/**
 * Hook to fetch supplier reviews
 */
export function useSupplierReviews(supplierId: string | undefined, page = 1, limit = 10) {
  return useQuery<{ data: any[]; pagination: any }>({
    queryKey: ['supplier-reviews', supplierId, page, limit],
    queryFn: async () => {
      if (!supplierId) throw new Error('Supplier ID is required');
      const res = await apiRequest('GET', `/api/suppliers/${supplierId}/reviews?page=${page}&limit=${limit}`);
      return res.json();
    },
    enabled: !!supplierId,
  });
}



