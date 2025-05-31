<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { DrinkService } from '$lib/services/drink.service';
	import { LibraryService, type CanLibraryItem } from '$lib/services/library.service';
	import type { Drink } from '$lib/types/drink';
	import SpendingOverTimeChart from '$lib/components/charts/layerchart/SpendingOverTimeChart.svelte';
	import DrinksBySeriesChart from '$lib/components/charts/layerchart/DrinksBySeriesChart.svelte';
	import RatingDistributionChart from '$lib/components/charts/layerchart/RatingDistributionChart.svelte';
	import DayOfWeekChart from '$lib/components/charts/layerchart/DayOfWeekChart.svelte';
	import CumulativeTotalChart from '$lib/components/charts/layerchart/CumulativeTotalChart.svelte';
	import CanDistributionChart from '$lib/components/charts/layerchart/CanDistributionChart.svelte';
	import ChartShimmerLoader from '$lib/components/ui/ChartShimmerLoader.svelte';

	let drinks: Drink[] = [];
	let canLibraryItems: CanLibraryItem[] = [];
	let loading = true;
	let error: string | null = null;
	let drinkService = new DrinkService();

	// Quick stats
	let totalDrinks = 0;
	let totalSpent = 0;
	let averageRating = 0;
	let favoriteSeries = '';

	onMount(async () => {
		try {
			const session = $page.data.session;
			if (!session?.user?.id) {
				throw new Error('User not authenticated');
			}

			[drinks, canLibraryItems] = await Promise.all([
				drinkService.getAllDrinks(),
				LibraryService.getCanLibrary()
			]);

			calculateQuickStats();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load drinks data';
			console.error('Error loading drinks data:', err);
		} finally {
			loading = false;
		}
	});

	function calculateQuickStats() {
		totalDrinks = drinks.length;
		totalSpent = drinks.reduce((sum, drink) => sum + drink.cost, 0);
		averageRating =
			drinks.length > 0 ? drinks.reduce((sum, drink) => sum + drink.rating, 0) / drinks.length : 0;

		// Find favorite series
		const seriesCount: Record<string, number> = {};
		drinks.forEach((drink) => {
			seriesCount[drink.series] = (seriesCount[drink.series] || 0) + 1;
		});

		const sortedSeries = Object.entries(seriesCount).sort(([, a], [, b]) => b - a);
		favoriteSeries = sortedSeries.length > 0 ? sortedSeries[0][0] : 'None';
	}
</script>

<svelte:head>
	<title>Analytics Dashboard - Monster Tracker</title>
	<meta
		name="description"
		content="View detailed analytics and charts of your Monster Energy drink consumption."
	/>
</svelte:head>

<div class="skeumorphic-page">
	<div class="page-header">
		<h1 class="page-title">📊 Analytics Dashboard</h1>
		<p class="page-description">Visualize your Monster Energy consumption patterns and insights</p>
	</div>

	{#if loading}
		<div class="loading-container">
			<div class="quick-stats">
				<div class="stats-grid">
					{#each Array(4) as _}
						<ChartShimmerLoader height="80px" />
					{/each}
				</div>
			</div>

			<div class="charts-container">
				<div class="charts-grid">
					{#each Array(6) as _}
						<ChartShimmerLoader height="350px" />
					{/each}
				</div>
			</div>
		</div>
	{:else if error}
		<div class="error-container">
			<div class="error-card">
				<div class="error-icon">⚠️</div>
				<h2>Failed to Load Analytics</h2>
				<p>{error}</p>
				<button class="retry-button" on:click={() => window.location.reload()}> Try Again </button>
			</div>
		</div>
	{:else}
		<!-- Quick Stats Summary -->
		<div class="quick-stats">
			<h2 class="section-title">📈 Quick Overview</h2>
			<div class="stats-grid">
				<div class="stat-card total-drinks">
					<div class="stat-icon">🥤</div>
					<div class="stat-content">
						<div class="stat-value">{totalDrinks}</div>
						<div class="stat-label">Total Drinks</div>
					</div>
				</div>

				<div class="stat-card total-spent">
					<div class="stat-icon">💰</div>
					<div class="stat-content">
						<div class="stat-value">${totalSpent.toFixed(2)}</div>
						<div class="stat-label">Total Spent</div>
					</div>
				</div>

				<div class="stat-card average-rating">
					<div class="stat-icon">⭐</div>
					<div class="stat-content">
						<div class="stat-value">{averageRating.toFixed(1)}</div>
						<div class="stat-label">Avg Rating</div>
					</div>
				</div>

				<div class="stat-card favorite-series">
					<div class="stat-icon">🏆</div>
					<div class="stat-content">
						<div class="stat-value favorite-text">{favoriteSeries}</div>
						<div class="stat-label">Favorite Series</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Charts Section -->
		{#if drinks.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📊</div>
				<h2>No Data Available</h2>
				<p>Start tracking your Monster Energy drinks to see analytics!</p>
				<a href="/add" class="add-drink-button">Add Your First Drink</a>
			</div>
		{:else}
			<div class="charts-container">
				<h2 class="section-title">📊 Detailed Analytics</h2>
				<div class="charts-grid">
					<SpendingOverTimeChart {drinks} />
					<DrinksBySeriesChart {drinks} />
					<RatingDistributionChart {drinks} />
					<DayOfWeekChart {drinks} />
					<CumulativeTotalChart {drinks} />
					<CanDistributionChart {canLibraryItems} />
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.skeumorphic-page {
		min-height: 100vh;
		padding: 20px;
		background: linear-gradient(
			135deg,
			rgba(10, 10, 10, 0.95) 0%,
			rgba(30, 30, 30, 0.9) 50%,
			rgba(10, 10, 10, 0.95) 100%
		);
	}

	.page-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
		margin-bottom: 8px;
		text-shadow:
			0 2px 4px rgba(0, 0, 0, 0.8),
			0 4px 8px rgba(0, 0, 0, 0.4);
		background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.page-description {
		font-size: 1.1rem;
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	.section-title {
		font-size: 1.8rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 20px;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
	}

	/* Quick Stats */
	.quick-stats {
		margin-bottom: 40px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 20px;
		margin-bottom: 20px;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(20px);
		transition: all 0.3s ease;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow:
			0 12px 32px rgba(0, 0, 0, 0.5),
			0 6px 16px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.stat-icon {
		font-size: 2rem;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 1.8rem;
		font-weight: 700;
		color: rgba(255, 255, 255, 0.95);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		margin-bottom: 4px;
	}

	.stat-value.favorite-text {
		font-size: 1.2rem;
		font-weight: 600;
	}

	.stat-label {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}

	/* Stat Card Specific Colors */
	.total-drinks {
		border-left: 4px solid #10b981;
	}

	.total-spent {
		border-left: 4px solid #f59e0b;
	}

	.average-rating {
		border-left: 4px solid #8b5cf6;
	}

	.favorite-series {
		border-left: 4px solid #ef4444;
	}

	/* Charts */
	.charts-container {
		margin-top: 48px;
	}

	.charts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
		gap: 32px;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Loading State */
	.loading-container {
		width: 100%;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* Error State */
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 400px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.error-card {
		text-align: center;
		padding: 48px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 16px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(20px);
		max-width: 500px;
		width: 100%;
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 16px;
	}

	.error-card h2 {
		color: rgba(255, 255, 255, 0.9);
		margin-bottom: 8px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
		font-size: 1.5rem;
	}

	.error-card p {
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 24px;
		font-size: 1rem;
	}

	.retry-button {
		padding: 14px 28px;
		background: linear-gradient(135deg, #ef4444, #dc2626);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
		font-size: 1rem;
	}

	.retry-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
	}

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 80px 40px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(20px);
		max-width: 600px;
		margin: 0 auto;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 24px;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
	}

	.empty-state h2 {
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.8rem;
		margin-bottom: 16px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
	}

	.empty-state p {
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 32px;
		font-size: 1.1rem;
	}

	.add-drink-button {
		display: inline-block;
		padding: 14px 28px;
		background: linear-gradient(135deg, #10b981, #059669);
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 600;
		transition: all 0.2s ease;
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
		font-size: 1rem;
	}

	.add-drink-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
	}

	/* Responsive Design */
	@media (max-width: 1200px) {
		.charts-grid {
			grid-template-columns: 1fr;
			max-width: 800px;
		}
	}

	@media (max-width: 768px) {
		.skeumorphic-page {
			padding: 16px;
		}

		.page-title {
			font-size: 2rem;
		}

		.charts-container {
			margin-top: 32px;
		}

		.charts-grid {
			gap: 20px;
		}

		.stats-grid {
			grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
			gap: 16px;
		}

		.stat-card {
			padding: 16px;
			gap: 12px;
		}

		.stat-icon {
			font-size: 1.5rem;
		}

		.stat-value {
			font-size: 1.4rem;
		}

		.empty-state {
			padding: 60px 20px;
		}

		.error-card {
			padding: 40px 20px;
		}
	}
</style>
