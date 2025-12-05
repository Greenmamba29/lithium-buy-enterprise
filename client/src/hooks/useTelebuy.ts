import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { createClient } from '@supabase/supabase-js';
import { useEffect } from 'react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface TelebuySession {
  id: string;
  supplier_id: string;
  user_id: string;
  meeting_url: string;
  meeting_id: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  recording_url: string | null;
  transcript: string | null;
  notes: string | null;
  suppliers?: {
    id: string;
    name: string;
    logo_url: string | null;
    verification_tier: string;
  };
}

/**
 * Hook to create a TELEBUY session
 */
export function useCreateTelebuySession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      supplier_id: string;
      scheduled_at: string;
      notes?: string;
    }) => {
      const res = await apiRequest('POST', '/api/telebuy/sessions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telebuy-sessions'] });
    },
  });
}

/**
 * Hook to get user's TELEBUY sessions
 */
export function useTelebuySessions(status?: string) {
  return useQuery<{ data: TelebuySession[] }>({
    queryKey: ['telebuy-sessions', status],
    queryFn: async () => {
      const url = status
        ? `/api/telebuy/sessions?status=${status}`
        : '/api/telebuy/sessions';
      const res = await apiRequest('GET', url);
      return res.json();
    },
  });
}

/**
 * Hook to get a single TELEBUY session
 */
export function useTelebuySession(id: string | undefined) {
  return useQuery<{ data: TelebuySession & { meeting_token?: string } }>({
    queryKey: ['telebuy-session', id],
    queryFn: async () => {
      if (!id) throw new Error('Session ID is required');
      const res = await apiRequest('GET', `/api/telebuy/sessions/${id}`);
      return res.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to subscribe to real-time session updates
 */
export function useRealtimeSession(sessionId: string | undefined) {
  useEffect(() => {
    if (!sessionId || !supabase) return;

    const channel = supabase
      .channel(`telebuy-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'telebuy_sessions',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Session update:', payload);
          // Invalidate query to refetch
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId]);
}



