import { supabase } from '$lib/supabase';
import type { Drink, DrinkFormData, DrinkFilters, DrinkStats } from '../types/drink';

export class DrinkService {
  async getAllDrinks(
    filters?: DrinkFilters,
    limit: number = 50,
    offset: number = 0
  ): Promise<Drink[]> {
    let query = supabase
      .from('drinks')
      .select('*')
      .order('consumed_at', { ascending: false });

    // Apply filters
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.series) {
      query = query.eq('series', filters.series);
    }

    if (filters?.dateFrom) {
      query = query.gte('consumed_at', filters.dateFrom);
    }

    if (filters?.dateTo) {
      query = query.lte('consumed_at', filters.dateTo);
    }

    // Apply pagination
    if (limit > 0) {
      query = query.limit(limit);
    }

    if (offset > 0) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  async getDrinkById(id: string): Promise<Drink | null> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async createDrink(drinkData: DrinkFormData): Promise<Drink> {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated to create drinks');
    }

    // Add user_id to the drink data
    const drinkWithUserId = {
      ...drinkData,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('drinks')
      .insert([drinkWithUserId])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateDrink(id: string, updateData: Partial<DrinkFormData>): Promise<Drink> {
    const { data, error } = await supabase
      .from('drinks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteDrink(id: string): Promise<void> {
    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getStats(): Promise<DrinkStats> {
    const { data, error } = await supabase
      .from('drinks')
      .select('cost, rating');

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return {
        totalSpent: 0,
        totalDrinks: 0,
        averageRating: 0
      };
    }

    const totalSpent = data.reduce((sum, drink) => sum + drink.cost, 0);
    const totalDrinks = data.length;
    const averageRating = data.reduce((sum, drink) => sum + drink.rating, 0) / totalDrinks;

    return {
      totalSpent,
      totalDrinks,
      averageRating
    };
  }

  async getRecentDrinks(limit: number = 5): Promise<Drink[]> {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('consumed_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
} 