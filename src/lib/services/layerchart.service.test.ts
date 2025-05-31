import { describe, it, expect } from 'vitest';
import { LayerChartService } from './layerchart.service';
import type { Drink } from '../types/drink';

describe('LayerChartService', () => {
  describe('getSpendingOverTimeData', () => {
    it('should group spending by date correctly', () => {
      const testDrinks: Drink[] = [
        {
          id: '1',
          name: 'Monster Energy',
          series: 'Normal',
          volume_ml: 500,
          cost: 2.99,
          rating: 4,
          notes: '',
          created_at: '2024-01-15T10:30:00Z',
          user_id: 'user1'
        },
        {
          id: '2',
          name: 'Monster Ultra',
          series: 'Ultra',
          volume_ml: 500,
          cost: 3.49,
          rating: 5,
          notes: '',
          created_at: '2024-01-15T14:30:00Z',
          user_id: 'user1'
        },
        {
          id: '3',
          name: 'Monster Juice',
          series: 'Juice',
          volume_ml: 500,
          cost: 3.99,
          rating: 3,
          notes: '',
          created_at: '2024-01-16T09:15:00Z',
          user_id: 'user1'
        }
      ];

      const result = LayerChartService.getSpendingOverTimeData(testDrinks);
      
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toMatchObject({
        amount: 6.48, // 2.99 + 3.49
        dateString: '2024-01-15'
      });
      expect(result.data[1]).toMatchObject({
        amount: 3.99,
        dateString: '2024-01-16'
      });
      
      expect(result.hoverData['2024-01-15']).toHaveLength(2);
      expect(result.hoverData['2024-01-16']).toHaveLength(1);
    });

    it('should handle single day with multiple drinks', () => {
      const testDrinks: Drink[] = [
        {
          id: '1',
          name: 'Monster Energy',
          series: 'Normal',
          volume_ml: 500,
          cost: 400.00,
          rating: 4,
          notes: '',
          created_at: '2024-01-15T10:30:00Z',
          user_id: 'user1'
        }
      ];

      const result = LayerChartService.getSpendingOverTimeData(testDrinks);
      
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toMatchObject({
        amount: 400.00,
        dateString: '2024-01-15'
      });
    });

    it('should handle empty drinks array', () => {
      const result = LayerChartService.getSpendingOverTimeData([]);
      
      expect(result.data).toEqual([]);
      expect(result.hoverData).toEqual({});
    });

    it('should sort dates chronologically', () => {
      const testDrinks: Drink[] = [
        {
          id: '1',
          name: 'Monster 3',
          series: 'Normal',
          volume_ml: 500,
          cost: 2.99,
          rating: 4,
          notes: '',
          created_at: '2024-01-17T10:30:00Z',
          user_id: 'user1'
        },
        {
          id: '2',
          name: 'Monster 1',
          series: 'Ultra',
          volume_ml: 500,
          cost: 3.49,
          rating: 5,
          notes: '',
          created_at: '2024-01-15T14:30:00Z',
          user_id: 'user1'
        },
        {
          id: '3',
          name: 'Monster 2',
          series: 'Juice',
          volume_ml: 500,
          cost: 3.99,
          rating: 3,
          notes: '',
          created_at: '2024-01-16T09:15:00Z',
          user_id: 'user1'
        }
      ];

      const result = LayerChartService.getSpendingOverTimeData(testDrinks);
      
      expect(result.data.map(d => d.dateString)).toEqual([
        '2024-01-15',
        '2024-01-16', 
        '2024-01-17'
      ]);
    });
  });

  describe('getRatingDistributionData', () => {
    it('should create histogram of ratings from 1-5 stars', () => {
      const testDrinks: Drink[] = [
        {
          id: '1',
          name: 'Monster 1',
          series: 'Normal',
          volume_ml: 500,
          cost: 2.99,
          rating: 3,
          notes: '',
          created_at: '2024-01-15T10:30:00Z',
          user_id: 'user1'
        },
        {
          id: '2',
          name: 'Monster 2',
          series: 'Ultra',
          volume_ml: 500,
          cost: 3.49,
          rating: 4,
          notes: '',
          created_at: '2024-01-15T14:30:00Z',
          user_id: 'user1'
        },
        {
          id: '3',
          name: 'Monster 3',
          series: 'Juice',
          volume_ml: 500,
          cost: 3.99,
          rating: 5,
          notes: '',
          created_at: '2024-01-16T09:15:00Z',
          user_id: 'user1'
        }
      ];

      const result = LayerChartService.getRatingDistributionData(testDrinks);
      
      expect(result.data).toHaveLength(5);
      expect(result.data[2].count).toBe(1); // 3-star rating (index 2)
      expect(result.data[3].count).toBe(1); // 4-star rating (index 3)
      expect(result.data[4].count).toBe(1); // 5-star rating (index 4)
    });

    it('should handle empty drinks array', () => {
      const result = LayerChartService.getRatingDistributionData([]);
      
      expect(result.data).toHaveLength(5);
      expect(result.data.every(d => d.count === 0)).toBe(true);
    });
  });
}); 