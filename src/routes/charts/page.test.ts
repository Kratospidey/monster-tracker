import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ChartsPage from './+page.svelte';

// Mock the chart components
vi.mock('$lib/components/charts', () => ({
  SpendingOverTimeChart: vi.fn(),
  DrinksBySeriesChart: vi.fn(),
  RatingDistributionChart: vi.fn(),
  DayOfWeekChart: vi.fn(),
  CumulativeTotalChart: vi.fn()
}));

// Mock the drink service
vi.mock('$lib/services/drink.service', () => ({
  DrinkService: {
    getAllDrinks: vi.fn().mockResolvedValue([])
  }
}));

describe('Charts Page', () => {
  it('should render all chart components', async () => {
    render(ChartsPage);
    
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Explore your drinking patterns and trends with interactive charts.')).toBeInTheDocument();
  });

  it('should display loading state initially', async () => {
    render(ChartsPage);
    
    // Should show shimmer loaders initially
    expect(screen.getAllByTestId('chart-shimmer-loader')).toHaveLength(5);
  });
}); 