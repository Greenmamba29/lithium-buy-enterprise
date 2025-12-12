import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Get the API base URL from environment variable or default to relative path
 * Supports Render + Netlify split deployment
 */
function getApiBaseUrl(): string {
  // In production (Netlify), use VITE_API_BASE_URL if set (points to Render backend)
  // In development, default to relative path (same origin)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  // Default to relative path for same-origin requests
  return "";
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get auth token if available
  let headers: HeadersInit = data ? { "Content-Type": "application/json" } : {};
  
  // Try to get auth token (will be null if not logged in)
  try {
    const { getAuthToken } = await import("@/hooks/useAuth");
    const token = await getAuthToken();
    if (token) {
      headers = { ...headers, Authorization: `Bearer ${token}` };
    }
  } catch {
    // Ignore if auth not available
  }

  // Prepend API base URL if URL doesn't already start with http
  const fullUrl = url.startsWith("http") ? url : `${getApiBaseUrl()}${url}`;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = queryKey.join("/") as string;
    // Prepend API base URL if URL doesn't already start with http
    const fullUrl = url.startsWith("http") ? url : `${getApiBaseUrl()}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      signal, // AbortController signal for request cancellation
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      // Cancel queries when component unmounts
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    },
    mutations: {
      retry: false,
    },
  },
});
