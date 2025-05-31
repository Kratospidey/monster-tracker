import type { Drink } from '../types/drink';

export interface LayerChartData {
  data: any[];
  xKey?: string;
  yKey?: string;
  rKey?: string;
  [key: string]: any;
}

export interface SpendingOverTimeData extends LayerChartData {
  hoverData: Record<string, Array<{
    name: string;
    cost: number;
    series: string;
    time: string;
  }>>;
}

export class LayerChartService {
  /**
   * Transform drinks data for spending over time chart with hover details
   */
  static getSpendingOverTimeData(drinks: Drink[]): SpendingOverTimeData {
    if (drinks.length === 0) {
      return {
        data: [],
        xKey: 'date',
        yKey: 'amount',
        hoverData: {}
      };
    }

    // Group drinks by date
    const drinksByDate: Record<string, Drink[]> = {};
    const dailySpending: Record<string, number> = {};

    drinks.forEach(drink => {
      const date = new Date(drink.created_at).toISOString().split('T')[0];
      if (!drinksByDate[date]) {
        drinksByDate[date] = [];
        dailySpending[date] = 0;
      }
      drinksByDate[date].push(drink);
      dailySpending[date] += drink.cost;
    });

    // Sort dates and create data array
    const sortedDates = Object.keys(dailySpending).sort();
    
    // Create hover data
    const hoverData: Record<string, Array<{
      name: string;
      cost: number;
      series: string;
      time: string;
    }>> = {};

    sortedDates.forEach(date => {
      hoverData[date] = drinksByDate[date].map(drink => ({
        name: drink.name,
        cost: drink.cost,
        series: drink.series,
        time: new Date(drink.created_at).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
    });

    const data = sortedDates.map(date => ({
      date: new Date(date),
      amount: dailySpending[date],
      dateString: date
    }));

    return {
      data,
      xKey: 'date',
      yKey: 'amount',
      hoverData
    };
  }

  /**
   * Transform drinks data for drinks by series chart
   */
  static getDrinksBySeriesData(drinks: Drink[]): LayerChartData {
    if (drinks.length === 0) {
      return {
        data: [],
        xKey: 'series',
        yKey: 'count'
      };
    }

    // Count drinks by series
    const seriesCount: Record<string, number> = {};
    drinks.forEach(drink => {
      seriesCount[drink.series] = (seriesCount[drink.series] || 0) + 1;
    });

    const data = Object.entries(seriesCount)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([series, count], index) => ({
        series,
        count,
        percentage: (count / drinks.length) * 100,
        index
      }));

    return {
      data,
      xKey: 'series',
      yKey: 'count'
    };
  }

  /**
   * Transform drinks data for rating distribution (1-5 stars)
   */
  static getRatingDistributionData(drinks: Drink[]): LayerChartData {
    const ratingCounts = [0, 0, 0, 0, 0]; // Index 0 = 1 star, Index 4 = 5 stars

    drinks.forEach(drink => {
      const ratingIndex = Math.max(0, Math.min(4, drink.rating - 1));
      ratingCounts[ratingIndex]++;
    });

    const data = ratingCounts.map((count, index) => ({
      rating: index + 1,
      ratingLabel: `${index + 1}★`,
      count,
      percentage: drinks.length > 0 ? (count / drinks.length) * 100 : 0
    }));

    return {
      data,
      xKey: 'rating',
      yKey: 'count'
    };
  }

  /**
   * Transform drinks data for day of week analysis
   */
  static getDrinksByDayOfWeekData(drinks: Drink[]): LayerChartData {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayCounts = [0, 0, 0, 0, 0, 0, 0];

    drinks.forEach(drink => {
      const date = new Date(drink.created_at);
      const dayOfWeek = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      dayCounts[dayOfWeek]++;
    });

    const data = dayNames.map((day, index) => ({
      day,
      dayIndex: index,
      count: dayCounts[index],
      percentage: drinks.length > 0 ? (dayCounts[index] / drinks.length) * 100 : 0
    }));

    return {
      data,
      xKey: 'dayIndex',
      yKey: 'count'
    };
  }

  /**
   * Transform drinks data for cumulative total cans over time
   */
  static getCumulativeTotalCansData(drinks: Drink[]): LayerChartData {
    if (drinks.length === 0) {
      return {
        data: [],
        xKey: 'date',
        yKey: 'total'
      };
    }

    // Sort drinks by date
    const sortedDrinks = [...drinks].sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // Group by date and calculate cumulative totals
    const dailyTotals: Record<string, number> = {};
    let cumulativeTotal = 0;

    sortedDrinks.forEach(drink => {
      const date = new Date(drink.created_at).toISOString().split('T')[0];
      if (!dailyTotals[date]) {
        dailyTotals[date] = cumulativeTotal;
      }
      cumulativeTotal++;
      dailyTotals[date] = cumulativeTotal;
    });

    const data = Object.keys(dailyTotals)
      .sort()
      .map(dateString => ({
        date: new Date(dateString),
        total: dailyTotals[dateString],
        dateString
      }));

    return {
      data,
      xKey: 'date',
      yKey: 'total'
    };
  }
} 