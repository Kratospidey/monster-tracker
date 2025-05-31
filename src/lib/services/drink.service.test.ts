import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DrinkFormData, DrinkFilters } from '../types/drink';

// Mock the entire DrinkService implementation
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

vi.mock('$lib/supabase', () => ({
  supabase: mockSupabaseClient
}));

// Import after mocking
const { DrinkService } = await import('./drink.service');

describe('DrinkService', () => {
  let drinkService: DrinkService;

  beforeEach(() => {
    vi.clearAllMocks();
    drinkService = new DrinkService();
  });

  describe('getAllDrinks', () => {
    it('should fetch all drinks with default parameters', async () => {
      const mockDrinks = [
        { id: '1', name: 'Monster Ultra', series: 'Ultra', volume_ml: 500, cost: 2.5, rating: 4 }
      ];
      
      // Mock the final promise resolution
      mockSupabaseClient.limit.mockResolvedValue({ data: mockDrinks, error: null });

      const result = await drinkService.getAllDrinks();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drinks');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(50);
      expect(result).toEqual(mockDrinks);
    });

    it('should apply filters when provided', async () => {
      const filters: DrinkFilters = {
        search: 'Ultra',
        series: 'Ultra',
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31'
      };

      // Mock the final promise resolution for the limit method since it's called last
      mockSupabaseClient.limit.mockResolvedValue({ data: [], error: null });

      await drinkService.getAllDrinks(filters, 10, 0);

      expect(mockSupabaseClient.ilike).toHaveBeenCalledWith('name', '%Ultra%');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('series', 'Ultra');
      expect(mockSupabaseClient.gte).toHaveBeenCalledWith('created_at', '2024-01-01');
      expect(mockSupabaseClient.lte).toHaveBeenCalledWith('created_at', '2024-12-31');
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(10);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockSupabaseClient.limit.mockResolvedValue({ data: null, error });

      await expect(drinkService.getAllDrinks()).rejects.toThrow('Database error');
    });
  });

  describe('getDrinkById', () => {
    it('should fetch a single drink by id', async () => {
      const mockDrink = { id: '1', name: 'Monster Ultra' };
      mockSupabaseClient.single.mockResolvedValue({ data: mockDrink, error: null });

      const result = await drinkService.getDrinkById('1');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drinks');
      expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockDrink);
    });
  });

  describe('createDrink', () => {
    it('should create a new drink', async () => {
      const formData: DrinkFormData = {
        name: 'Monster Ultra',
        series: 'Ultra',
        volume_ml: 500,
        cost: 2.5,
        rating: 4,
        notes: 'Great taste'
      };
      const mockCreatedDrink = { id: '1', ...formData };
      mockSupabaseClient.single.mockResolvedValue({ data: mockCreatedDrink, error: null });

      const result = await drinkService.createDrink(formData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drinks');
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith([formData]);
      expect(result).toEqual(mockCreatedDrink);
    });
  });

  describe('updateDrink', () => {
    it('should update an existing drink', async () => {
      const updateData: Partial<DrinkFormData> = {
        rating: 5,
        notes: 'Even better than before'
      };
      const mockUpdatedDrink = { id: '1', ...updateData };
      mockSupabaseClient.single.mockResolvedValue({ data: mockUpdatedDrink, error: null });

      const result = await drinkService.updateDrink('1', updateData);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drinks');
      expect(mockSupabaseClient.update).toHaveBeenCalledWith(updateData);
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockUpdatedDrink);
    });
  });

  describe('deleteDrink', () => {
    it('should delete a drink', async () => {
      mockSupabaseClient.eq.mockResolvedValue({ data: null, error: null });

      await drinkService.deleteDrink('1');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('drinks');
      expect(mockSupabaseClient.delete).toHaveBeenCalled();
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('id', '1');
    });
  });

  describe('getStats', () => {
    it('should calculate drink statistics', async () => {
      const mockDrinks = [
        { cost: 2.5, rating: 4 },
        { cost: 3.0, rating: 5 },
        { cost: 2.0, rating: 3 }
      ];
      mockSupabaseClient.select.mockResolvedValue({ data: mockDrinks, error: null });

      const result = await drinkService.getStats();

      expect(result).toEqual({
        totalSpent: 7.5,
        totalDrinks: 3,
        averageRating: 4
      });
    });

    it('should handle empty data', async () => {
      mockSupabaseClient.select.mockResolvedValue({ data: [], error: null });

      const result = await drinkService.getStats();

      expect(result).toEqual({
        totalSpent: 0,
        totalDrinks: 0,
        averageRating: 0
      });
    });
  });
}); 