import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession } }) => {
  const { session } = await safeGetSession();

  if (session) {
    throw redirect(303, '/');
  }

  return {};
};

export const actions: Actions = {
  login: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validation
    if (!email || !password) {
      return fail(400, {
        error: 'Email and password are required',
        email,
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, {
        error: 'Please enter a valid email address',
        email,
      });
    }

    // Attempt to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return fail(400, {
          error: 'Invalid email or password. Please check your credentials and try again.',
          email,
        });
      }
      
      if (error.message.includes('Email not confirmed') || error.code === 'email_not_confirmed') {
        return fail(400, {
          error: 'Please check your email and click the confirmation link before signing in. If you haven\'t received the email, please check your spam folder.',
          email,
        });
      }

      if (error.message.includes('Too many requests')) {
        return fail(400, {
          error: 'Too many login attempts. Please wait a moment before trying again.',
          email,
        });
      }

      return fail(400, {
        error: error.message || 'An error occurred during sign in. Please try again.',
        email,
      });
    }

    // Check if login was successful and redirect
    if (data.session) {
      console.log('User logged in successfully:', data.user?.id);
      throw redirect(303, '/');
    }

    return fail(500, {
      error: 'An unexpected error occurred. Please try again.',
      email,
    });
  },
}; 