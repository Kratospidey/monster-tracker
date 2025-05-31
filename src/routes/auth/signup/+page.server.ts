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
  signup: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validation
    if (!email || !password || !confirmPassword) {
      return fail(400, {
        error: 'All fields are required',
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

    // Password validation
    if (password.length < 6) {
      return fail(400, {
        error: 'Password must be at least 6 characters long',
        email,
      });
    }

    // Password confirmation
    if (password !== confirmPassword) {
      return fail(400, {
        error: 'Passwords do not match',
        email,
      });
    }

    // Attempt to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${new URL(request.url).origin}/auth/callback`,
        data: {
          // You can add additional user metadata here
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error.message.includes('User already registered')) {
        return fail(400, {
          error: 'An account with this email already exists. Please sign in instead.',
          email,
        });
      }
      
      if (error.message.includes('Password should be at least')) {
        return fail(400, {
          error: 'Password is too weak. Please choose a stronger password.',
          email,
        });
      }

      return fail(400, {
        error: error.message || 'An error occurred during signup. Please try again.',
        email,
      });
    }

    // Check if user was created successfully
    if (data.user) {
      console.log('User created successfully:', data.user.id);
      
      // Check if email confirmation is required
      if (!data.session) {
        return {
          success: true,
          message: 'Account created! Please check your email for a confirmation link.',
          requiresConfirmation: true,
        };
      } else {
        return {
          success: true,
          message: 'Account created successfully! You are now signed in.',
          requiresConfirmation: false,
        };
      }
    }

    return fail(500, {
      error: 'An unexpected error occurred. Please try again.',
      email,
    });
  },
}; 