import { describe, it, expect } from 'vitest';
import { ChartService } from './chart.service';
import type { Drink } from '../types/drink';

const mockDrinks: Drink[] = [
  {
    id: '1',
    created_at: '2024-01-15T10:00:00Z',
    name: 'Monster Energy',
    series: 'Normal',
    volume_ml: 500,
    cost: 2.99,
    rating: 4,
    notes: null,
    user_id: 'user1'
  },
  {
    id: '2',
    created_at: '2024-01-16T14:30:00Z',
    name: 'Monster Ultra White',
    series: 'Ultra',
    volume_ml: 500,
    cost: 3.49,
    rating: 5,
    notes: null,
    user_id: 'user1'
  },
  {
    id: '3',
    created_at: '2024-01-17T09:15:00Z',
    name: 'Monster Juice Mango Loco',
    series: 'Juice',
    volume_ml: 473,
    cost: 3.99,
    rating: 3,
    notes: null,
    user_id: 'user1'
  },
  {
    id: '4',
    created_at: '2024-01-16T16:45:00Z',
    name: 'Monster Energy (Another)',
    series: 'Normal',
    volume_ml: 500,
    cost: 2.99,
    rating: 4,
    notes: null,
    user_id: 'user1'
  },
  {
    id: '5',
    created_at: '2024-01-18T11:20:00Z',
    name: 'Monster Ultra Blue',
    series: 'Ultra',
    volume_ml: 500,
    cost: 3.49,
    rating: 5,
    notes: null,
    user_id: 'user1'
  }
];

describe('ChartService', () => {
  describe('getSpendingOverTimeData', () => {
    it('should group spending by date and provide drink details for hover', () => {
      const result = ChartService.getSpendingOverTimeData(mockDrinks);
      
      expect(result.labels).toEqual(['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18']);
      expect(result.datasets[0].data).toEqual([2.99, 6.48, 3.99, 3.49]); // cumulative spending per day
      expect(result.hoverData).toHaveProperty('2024-01-15');
      expect(result.hoverData['2024-01-15'][0]).toMatchObject({
        name: 'Monster Energy',
        cost: 2.99,
        series: 'Normal'
      });
    });

    it('should handle empty drinks array', () => {
      const result = ChartService.getSpendingOverTimeData([]);
      
      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
      expect(result.hoverData).toEqual({});
    });
  });

  describe('getDrinksBySeriesData', () => {
    it('should count drinks by series', () => {
      const result = ChartService.getDrinksBySeriesData(mockDrinks);
      
      expect(result.labels).toEqual(['Juice', 'Normal', 'Ultra']);
      expect(result.datasets[0].data).toEqual([1, 2, 2]);
    });

    it('should handle empty drinks array', () => {
      const result = ChartService.getDrinksBySeriesData([]);
      
      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });
  });

  describe('getRatingDistributionData', () => {
    it('should create histogram of ratings from 1-5 stars', () => {
      const result = ChartService.getRatingDistributionData(mockDrinks);
      
      expect(result.labels).toEqual(['1★', '2★', '3★', '4★', '5★']);
      expect(result.datasets[0].data).toEqual([0, 0, 1, 2, 2]); // counts for each rating
    });

    it('should handle empty drinks array', () => {
      const result = ChartService.getRatingDistributionData([]);
      
      expect(result.labels).toEqual(['1★', '2★', '3★', '4★', '5★']);
      expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('getDrinksByDayOfWeekData', () => {
    it('should count drinks by day of week', () => {
      const result = ChartService.getDrinksByDayOfWeekData(mockDrinks);
      
      expect(result.labels).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
      // Jan 15, 2024 was Monday, Jan 16 was Tuesday, etc.
      expect(result.datasets[0].data).toEqual([1, 2, 1, 1, 0, 0, 0]);
    });

    it('should handle empty drinks array', () => {
      const result = ChartService.getDrinksByDayOfWeekData([]);
      
      expect(result.labels).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
      expect(result.datasets[0].data).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });
  });

  describe('getCumulativeTotalCansData', () => {
    it('should create running total of cans over time', () => {
      const result = ChartService.getCumulativeTotalCansData(mockDrinks);
      
      expect(result.labels).toEqual(['2024-01-15', '2024-01-16', '2024-01-17', '2024-01-18']);
      expect(result.datasets[0].data).toEqual([1, 3, 4, 5]); // running total
    });

    it('should handle empty drinks array', () => {
      const result = ChartService.getCumulativeTotalCansData([]);
      
      expect(result.labels).toEqual([]);
      expect(result.datasets[0].data).toEqual([]);
    });
  });
}); 