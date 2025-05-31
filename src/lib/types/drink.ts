import type { Database } from '../database.types';

export type Drink = Database['public']['Tables']['drinks']['Row'];
export type DrinkInsert = Database['public']['Tables']['drinks']['Insert'];
export type DrinkUpdate = Database['public']['Tables']['drinks']['Update'];

export const DRINK_SERIES = ['Normal', 'Ultra', 'Juice', 'Reserve', 'Special'] as const;
export type DrinkSeries = typeof DRINK_SERIES[number];

export interface DrinkFormData {
  name: string;
  series: DrinkSeries;
  volume_ml: number;
  cost: number;
  rating: number;
  notes?: string;
  created_at?: string;
}

export interface DrinkStats {
  totalSpent: number;
  totalDrinks: number;
  averageRating: number;
}

export interface DrinkFilters {
  search?: string;
  series?: DrinkSeries;
  dateFrom?: string;
  dateTo?: string;
} 