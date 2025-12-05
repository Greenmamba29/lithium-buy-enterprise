import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface SearchFilters {
  q: string;
  type?: 'suppliers' | 'products' | 'all';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  data: {
    suppliers: any[];
    products: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Hook to perform full-text search
 */
export function useSearch(filters: SearchFilters) {
  return useQuery<SearchResponse>({
    queryKey: ['search', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('q', filters.q);
      if (filters.type) params.append('type', filters.type);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const res = await apiRequest('GET', `/api/search?${params.toString()}`);
      return res.json();
    },
    enabled: !!filters.q && filters.q.length > 0,
  });
}




