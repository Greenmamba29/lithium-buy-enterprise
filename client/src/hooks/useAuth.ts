import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Initialize Supabase client for frontend
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface User {
  id: string;
  email: string;
  role?: string;
}

/**
 * Hook to get current user
 */
export function useAuth() {
  return useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      if (!supabase) return null;

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Get user profile for role
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email || '',
        role: profile?.role || 'buyer',
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to sign in with email/password
 */
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: ['auth'] });

      return data;
    },
  });
}

/**
 * Hook to sign up
 */
export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, companyName }: { email: string; password: string; companyName?: string }) => {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await supabase.from('user_profiles').insert({
          user_id: data.user.id,
          company_name: companyName || null,
          role: 'buyer',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['auth'] });

      return data;
    },
  });
}

/**
 * Hook to sign out
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!supabase) throw new Error('Supabase not configured');

      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      queryClient.clear();
    },
  });
}

/**
 * Get auth token for API requests
 */
export async function getAuthToken(): Promise<string | null> {
  if (!supabase) return null;

  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}



