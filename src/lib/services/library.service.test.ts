import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Drink } from '../types/drink';

// Mock the modules with inline objects to avoid hoisting issues
vi.mock('$lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    })),
    storage: {
      from: vi.fn()
    }
  }
}));

vi.mock('$app/environment', () => ({
  browser: false
}));

import { LibraryService } from './library.service';
import { supabase } from '$lib/supabase';

// Type assertion to access mock methods
const mockSupabase = supabase as any;

describe('LibraryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCanLibrary', () => {
    it('should return empty array when no drinks exist', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      // Mock empty drinks response
      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      const result = await LibraryService.getCanLibrary();

      expect(result).toEqual([]);
      expect(mockSupabase.from).toHaveBeenCalledWith('drinks');
    });

    it('should aggregate drinks correctly by name and series', async () => {
      // Mock authenticated user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      // Mock drinks data
      const mockDrinks: Drink[] = [
        {
          id: '1',
          name: 'Monster Energy',
          series: 'Normal',
          volume_ml: 473,
          cost: 3.50,
          rating: 4,
          created_at: '2024-01-01T10:00:00Z',
          notes: '',
          user_id: 'user-1'
        },
        {
          id: '2',
          name: 'Monster Energy',
          series: 'Normal',
          volume_ml: 473,
          cost: 3.50,
          rating: 5,
          created_at: '2024-01-02T10:00:00Z',
          notes: '',
          user_id: 'user-1'
        },
        {
          id: '3',
          name: 'Monster Ultra',
          series: 'Ultra',
          volume_ml: 473,
          cost: 4.00,
          rating: 3,
          created_at: '2024-01-03T10:00:00Z',
          notes: '',
          user_id: 'user-1'
        }
      ];

      // Mock drinks query
      const mockDrinksQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: mockDrinks,
          error: null
        })
      };
      
      // Mock images query that fails (simulating no database table)
      const mockImagesQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockRejectedValue(new Error('Table does not exist'))
      };

      mockSupabase.from
        .mockReturnValueOnce(mockDrinksQuery)  // First call for drinks
        .mockReturnValueOnce(mockImagesQuery); // Second call for images

      const result = await LibraryService.getCanLibrary();

      expect(result).toHaveLength(2);

      // Check Monster Energy Normal aggregation
      const monsterNormal = result.find(item => item.name === 'Monster Energy' && item.series === 'Normal');
      expect(monsterNormal).toEqual({
        id: 'Monster Energy_Normal',
        name: 'Monster Energy',
        series: 'Normal',
        volume_ml: 473,
        count: 2,
        totalSpent: 7.00,
        averageRating: 4.5,
        imageUrl: undefined,
        firstPurchased: '2024-01-01T10:00:00Z',
        lastPurchased: '2024-01-02T10:00:00Z'
      });

      // Check Monster Ultra aggregation
      const monsterUltra = result.find(item => item.name === 'Monster Ultra' && item.series === 'Ultra');
      expect(monsterUltra).toEqual({
        id: 'Monster Ultra_Ultra',
        name: 'Monster Ultra',
        series: 'Ultra',
        volume_ml: 473,
        count: 1,
        totalSpent: 4.00,
        averageRating: 3,
        imageUrl: undefined,
        firstPurchased: '2024-01-03T10:00:00Z',
        lastPurchased: '2024-01-03T10:00:00Z'
      });

      // Should be sorted by count (descending)
      expect(result[0].count).toBeGreaterThanOrEqual(result[1].count);
    });

    it('should handle authentication errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      await expect(LibraryService.getCanLibrary()).rejects.toThrow('User must be authenticated');
    });

    it('should handle database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null
      });

      const mockQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database error' }
        })
      };
      mockSupabase.from.mockReturnValue(mockQuery);

      await expect(LibraryService.getCanLibrary()).rejects.toThrow('Database error');
    });
  });
}); 