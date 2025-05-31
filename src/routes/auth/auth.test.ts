import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fail, redirect } from '@sveltejs/kit';
import { actions as signupActions } from './signup/+page.server.js';
import { actions as loginActions } from './login/+page.server.js';

// Mock Supabase
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
  },
};

// Mock locals
const mockLocals = {
  supabase: mockSupabase,
};

// Mock request
const createMockRequest = (formData: Record<string, string>) => {
  const form = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    form.append(key, value);
  });
  
  return {
    formData: () => Promise.resolve(form),
    url: 'http://localhost:3000',
  };
};

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Signup', () => {
    it('should successfully sign up a user', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({ error: null });
      
      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await signupActions.signup({
        request,
        locals: mockLocals,
      });

      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
        },
      });

      expect(result).toEqual({
        success: true,
        message: 'Check your email for a confirmation link',
      });
    });

    it('should fail with missing email', async () => {
      const request = createMockRequest({
        password: 'password123',
      });

      const result = await signupActions.signup({
        request,
        locals: mockLocals,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Email and password are required');
    });

    it('should fail with short password', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        password: '123',
      });

      const result = await signupActions.signup({
        request,
        locals: mockLocals,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Password must be at least 6 characters long');
    });

    it('should handle Supabase errors', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        error: { message: 'User already exists' },
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      const result = await signupActions.signup({
        request,
        locals: mockLocals,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('User already exists');
    });
  });

  describe('Login', () => {
    it('should successfully log in a user', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      });

      try {
        await loginActions.login({
          request,
          locals: mockLocals,
        });
      } catch (error) {
        // Should throw a redirect
        expect(error.status).toBe(303);
        expect(error.location).toBe('/');
      }

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should fail with missing credentials', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
      });

      const result = await loginActions.login({
        request,
        locals: mockLocals,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Email and password are required');
    });

    it('should handle login errors', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        error: { message: 'Invalid credentials' },
      });

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      const result = await loginActions.login({
        request,
        locals: mockLocals,
      });

      expect(result.status).toBe(400);
      expect(result.data.error).toBe('Invalid credentials');
    });
  });
}); 