import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from './database.types';

// Client-side Supabase client
export const supabase = createBrowserClient<Database>(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
);

// Server-side Supabase client
export function createSupabaseServerClient(fetch: any) {
  return createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        get(key) {
          // This will be handled by SvelteKit hooks
          return '';
        },
        set(key, value, options) {
          // This will be handled by SvelteKit hooks
        },
        remove(key, options) {
          // This will be handled by SvelteKit hooks
        },
      },
    }
  );
} 