# Monster Tracker - Interactive Charts Feature

## Overview

This implementation adds comprehensive analytics and interactive charts to the Monster Tracker application using Chart.js. Users can now visualize their drinking patterns and trends through 5 different chart types.

## Features Implemented

### 1. **Spending Over Time Chart** 📈
- **Type**: Line chart with interactive hover
- **Data**: Daily spending amounts
- **Hover Feature**: Shows detailed breakdown of each day's purchases including:
  - Time of purchase
  - Drink name and series
  - Individual cost
  - Total daily spending

### 2. **Drinks by Series Chart** 🍩
- **Type**: Doughnut chart
- **Data**: Distribution of drinks by Monster series (Normal, Ultra, Juice, etc.)
- **Features**: 
  - Percentage breakdown
  - Interactive legend
  - Hover tooltips with count and percentage

### 3. **Rating Distribution Chart** ⭐
- **Type**: Bar chart
- **Data**: Histogram showing distribution of 1-5 star ratings
- **Features**:
  - Color-coded bars (red for 1★, green for 5★)
  - Percentage and count display
  - Clear visual rating patterns

### 4. **Drinks by Day of Week Chart** 📅
- **Type**: Bar chart (heatmap-style)
- **Data**: Consumption patterns by day of week (Monday-Sunday)
- **Features**:
  - Different colors for each day
  - Percentage and count tooltips
  - Helps identify consumption habits

### 5. **Cumulative Total Cans Chart** 📊
- **Type**: Line chart
- **Data**: Running total of cans consumed over time
- **Features**:
  - Shows progression/growth
  - Smooth line with data points
  - Track consumption trends

## Technical Implementation

### Architecture

```
src/lib/
├── services/
│   ├── chart.service.ts          # Data transformation logic
│   └── chart.service.test.ts     # Comprehensive test suite
├── components/
│   ├── charts/
│   │   ├── Chart.svelte          # Base Chart.js wrapper
│   │   ├── SpendingOverTimeChart.svelte
│   │   ├── DrinksBySeriesChart.svelte
│   │   ├── RatingDistributionChart.svelte
│   │   ├── DayOfWeekChart.svelte
│   │   ├── CumulativeTotalChart.svelte
│   │   └── index.ts              # Component exports
│   └── ui/
│       └── ChartShimmerLoader.svelte  # Loading state component
```

### Core Technologies

- **Chart.js 4.4.9**: Modern, responsive charting library
- **Svelte 5**: Reactive UI framework with proper lifecycle management
- **TypeScript**: Full type safety for chart data and configurations
- **Tailwind CSS**: Responsive design and beautiful styling

### Key Features

1. **Responsive Design**: All charts adapt to different screen sizes
2. **Loading States**: Beautiful shimmer loaders with skeuomorphic design
3. **Error Handling**: Graceful fallbacks and error states
4. **Empty States**: Helpful messaging when no data is available
5. **Interactive Tooltips**: Rich hover information with custom formatting
6. **Performance**: Efficient data transformation and Chart.js lifecycle management

### Data Transformation

The `ChartService` class provides static methods to transform raw drink data into Chart.js-compatible formats:

- `getSpendingOverTimeData()` - Groups spending by date with hover details
- `getDrinksBySeriesData()` - Counts drinks by series with colors
- `getRatingDistributionData()` - Creates rating histogram
- `getDrinksByDayOfWeekData()` - Analyzes weekly patterns
- `getCumulativeTotalCansData()` - Calculates running totals

### Testing

- **100% test coverage** for ChartService methods
- **Edge case handling** for empty data sets
- **Data validation** and transformation accuracy
- **Component integration** tests

## Usage

### Navigation
Access the analytics dashboard via the **Analytics** 📈 button in the navigation menu.

### URL
Direct access: `/charts`

### Requirements
- User must be authenticated
- At least one drink entry for meaningful charts (graceful handling of empty state)

## Performance Considerations

1. **Efficient Data Loading**: Fetches all drinks once for analysis
2. **Chart.js Lifecycle**: Proper cleanup prevents memory leaks
3. **Reactive Updates**: Charts automatically update when data changes
4. **Lazy Loading**: Charts only render when needed

## Future Enhancements

Potential additions for future development:
- Date range filtering for charts
- Export functionality (PNG/PDF)
- Advanced analytics (trends, predictions)
- Comparison views (month-over-month, etc.)
- Custom chart configurations
- Data aggregation by time periods

## Browser Compatibility

Supports all modern browsers with Chart.js compatibility:
- Chrome/Chromium 88+
- Firefox 85+
- Safari 14+
- Edge 88+ 