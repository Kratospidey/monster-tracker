import { createBrowserClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { LayoutLoad } from './$types';
import type { Database } from '$lib/database.types';

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
  depends('supabase:auth');

  const supabase = createBrowserClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        fetch,
      },
      cookies: {
        getAll() {
          return data.cookies;
        },
        setAll(cookiesToSet) {
          /**
           * A convenience helper for getting a refreshed session. It's not part of the official
           * @supabase/ssr API, but we need to refresh sessions on the client side so we expose
           * this function here.
           *
           * It's basically a no-op on the client side since we can't set cookies from here,
           * but it needs to be defined to avoid TypeScript errors.
           */
          cookiesToSet.forEach(({ name, value, options }) => {
            document.cookie = `${name}=${value}; path=/; ${options ? Object.entries(options).map(([key, val]) => `${key}=${val}`).join('; ') : ''}`;
          });
        },
      },
    }
  );

  /**
   * Using getUser() instead of getSession() to ensure JWT validation
   * and avoid deprecation warnings.
   */
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error getting user in layout load:", error);
    return { supabase, session: null };
  }

  // Create session object with user if user exists
  const session = user ? { user } : null;

  return { supabase, session };
}; 