<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { DrinkService } from '$lib/services/drink.service';
	import type { Drink, DrinkStats } from '$lib/types/drink';

	let drinkService = new DrinkService();
	let recentDrinks: Drink[] = [];
	let stats: DrinkStats = {
		totalSpent: 0,
		totalDrinks: 0,
		averageRating: 0
	};
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			// Load stats and recent drinks in parallel
			const [statsData, recentData] = await Promise.all([
				drinkService.getStats(),
				drinkService.getRecentDrinks(5)
			]);

			stats = statsData;
			recentDrinks = recentData;
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			loading = false;
		}
	});

	function formatCurrency(amount: number): string {
		return `₹${amount.toFixed(2)}`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	function getSeriesBadgeClass(series: string): string {
		const seriesColors = {
			normal: '#64748b',
			ultra: '#3b82f6',
			juice: '#f97316',
			reserve: '#8b5cf6',
			special: '#ef4444'
		};

		const color =
			seriesColors[series.toLowerCase() as keyof typeof seriesColors] || seriesColors['normal'];
		return `metal-badge inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white`;
	}

	function getSeriesColor(series: string): string {
		const seriesColors = {
			normal: '#64748b',
			ultra: '#3b82f6',
			juice: '#f97316',
			reserve: '#8b5cf6',
			special: '#ef4444'
		};

		return (
			seriesColors[series.toLowerCase() as keyof typeof seriesColors] || seriesColors['normal']
		);
	}
</script>

<svelte:head>
	<title>Dashboard - Monster Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Stats Panel -->
	<div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
		<!-- Total Spent Card -->
		<Card class="metal-card">
			<CardContent class="flex items-center p-6">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-8 w-8 items-center justify-center rounded-md">
						<span class="text-lg drop-shadow">💰</span>
					</div>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow">Total Spent</dt>
						<dd class="text-2xl font-bold text-white drop-shadow-lg">
							{#if loading}
								<div class="skeuomorphic-loader">
									<div class="loading-shimmer"></div>
									<span class="sr-only">Loading...</span>
								</div>
							{:else}
								{formatCurrency(stats.totalSpent)}
							{/if}
						</dd>
					</dl>
				</div>
			</CardContent>
		</Card>

		<!-- Total Cans Card -->
		<Card class="metal-card">
			<CardContent class="flex items-center p-6">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-8 w-8 items-center justify-center rounded-md">
						<span class="text-lg drop-shadow">🥤</span>
					</div>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow">Total Cans</dt>
						<dd class="text-2xl font-bold text-white drop-shadow-lg">
							{#if loading}
								<div class="skeuomorphic-loader">
									<div class="loading-shimmer"></div>
									<span class="sr-only">Loading...</span>
								</div>
							{:else}
								{stats.totalDrinks}
							{/if}
						</dd>
					</dl>
				</div>
			</CardContent>
		</Card>

		<!-- Average Rating Card -->
		<Card class="metal-card">
			<CardContent class="flex items-center p-6">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-8 w-8 items-center justify-center rounded-md">
						<span class="text-lg drop-shadow">⭐</span>
					</div>
				</div>
				<div class="ml-5 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow">Average Rating</dt>
						<dd class="text-2xl font-bold text-white drop-shadow-lg">
							{#if loading}
								<div class="skeuomorphic-loader">
									<div class="loading-shimmer"></div>
									<span class="sr-only">Loading...</span>
								</div>
							{:else if stats.averageRating > 0}
								{stats.averageRating.toFixed(1)}
							{:else}
								<span class="text-gray-400">N/A</span>
							{/if}
						</dd>
					</dl>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Quick Add Button (Desktop) -->
	<div class="hidden justify-end md:flex">
		<a href="/drinks/add" class="metal-button-primary">
			<span class="mr-2 drop-shadow">+</span>
			<span class="drop-shadow">Add Drink</span>
		</a>
	</div>

	<!-- Recent Drinks Section -->
	<Card class="metal-card">
		<CardHeader class="metal-header">
			<CardTitle class="flex items-center justify-between">
				<span class="text-white drop-shadow-lg">Recent Drinks</span>
				<a href="/drinks" class="metal-button-secondary">View All</a>
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if loading}
				<div class="py-8">
					<div class="space-y-4">
						{#each Array(3) as _, i}
							<div class="metal-drink-item-skeleton">
								<div class="flex-1">
									<div class="space-y-2">
										<div class="skeuomorphic-loader skeleton-title">
											<div class="loading-shimmer"></div>
										</div>
										<div class="flex space-x-2">
											<div class="skeuomorphic-loader skeleton-badge">
												<div class="loading-shimmer"></div>
											</div>
											<div class="skeuomorphic-loader skeleton-text">
												<div class="loading-shimmer"></div>
											</div>
										</div>
									</div>
								</div>
								<div class="space-y-2">
									<div class="skeuomorphic-loader skeleton-price">
										<div class="loading-shimmer"></div>
									</div>
									<div class="skeuomorphic-loader skeleton-rating">
										<div class="loading-shimmer"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="mt-4 text-center">
						<div class="inline-flex items-center space-x-2 text-gray-300">
							<div class="loading-pulse">⚡</div>
							<span class="drop-shadow">Loading your drinks...</span>
						</div>
					</div>
				</div>
			{:else if error}
				<div class="py-8 text-center">
					<div class="mb-2 text-red-400 drop-shadow">⚠️ Error loading data</div>
					<p class="text-gray-300 drop-shadow">{error}</p>
				</div>
			{:else if recentDrinks.length === 0}
				<div class="py-8 text-center">
					<div class="mb-4 text-gray-300">
						<span class="text-4xl drop-shadow">🥤</span>
					</div>
					<h3 class="mb-2 text-lg font-medium text-white drop-shadow">No drinks logged yet</h3>
					<p class="mb-4 text-gray-300 drop-shadow">Start tracking your Monster consumption!</p>
					<a href="/drinks/add" class="metal-button-primary">Add Your First Drink</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each recentDrinks as drink}
						<div class="metal-drink-item">
							<div class="flex-1">
								<div class="flex items-center space-x-3">
									<div>
										<h4 class="font-medium text-white drop-shadow">{drink.name}</h4>
										<div class="mt-1 flex items-center space-x-2">
											<span
												class={getSeriesBadgeClass(drink.series)}
												style="background: linear-gradient(135deg, {getSeriesColor(
													drink.series
												)}CC, {getSeriesColor(drink.series)}AA)"
											>
												{drink.series}
											</span>
											<span class="text-sm text-gray-300 drop-shadow">
												{drink.volume_ml}ml
											</span>
											<span class="text-sm text-gray-300 drop-shadow">•</span>
											<span class="text-sm text-gray-300 drop-shadow">
												{formatDateTime(drink.consumed_at)}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div class="flex items-center space-x-4">
								<div class="text-right">
									<div class="font-semibold text-white drop-shadow">
										{formatCurrency(drink.cost)}
									</div>
									<div class="flex items-center text-sm text-gray-300 drop-shadow">
										<span class="mr-1">⭐</span>
										<span>{drink.rating}/5</span>
									</div>
								</div>
								<a href="/drinks/{drink.id}/edit" class="metal-button-ghost">Edit</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Quick Actions & Daily Summary Section -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
		<!-- Quick Actions -->
		<Card class="metal-card">
			<CardHeader class="metal-header">
				<CardTitle class="text-white drop-shadow-lg">Quick Actions</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid grid-cols-2 gap-3">
					<a href="/drinks/add" class="metal-quick-action-button">
						<div class="action-icon">➕</div>
						<span class="action-text">Add Drink</span>
					</a>
					<a href="/charts" class="metal-quick-action-button">
						<div class="action-icon">📊</div>
						<span class="action-text">Analytics</span>
					</a>
					<a href="/library" class="metal-quick-action-button">
						<div class="action-icon">📚</div>
						<span class="action-text">Library</span>
					</a>
					<a href="/drinks" class="metal-quick-action-button">
						<div class="action-icon">🥤</div>
						<span class="action-text">All Drinks</span>
					</a>
				</div>
			</CardContent>
		</Card>

		<!-- Today's Summary -->
		<Card class="metal-card">
			<CardHeader class="metal-header">
				<CardTitle class="text-white drop-shadow-lg">Today's Summary</CardTitle>
			</CardHeader>
			<CardContent>
				{#if loading}
					<div class="space-y-4">
						<div class="today-summary-skeleton">
							<div class="skeuomorphic-loader skeleton-stat">
								<div class="loading-shimmer"></div>
							</div>
						</div>
						<div class="today-summary-skeleton">
							<div class="skeuomorphic-loader skeleton-stat">
								<div class="loading-shimmer"></div>
							</div>
						</div>
					</div>
				{:else}
					{@const todaysDrinks = recentDrinks.filter((drink) => {
						const today = new Date();
						const drinkDate = new Date(drink.consumed_at);
						return drinkDate.toDateString() === today.toDateString();
					})}
					{@const todaysSpent = todaysDrinks.reduce((sum, drink) => sum + drink.cost, 0)}

					<div class="space-y-4">
						<div class="today-summary-item">
							<div class="summary-icon">🥤</div>
							<div class="summary-content">
								<div class="summary-label">Drinks Today</div>
								<div class="summary-value">{todaysDrinks.length}</div>
							</div>
						</div>

						<div class="today-summary-item">
							<div class="summary-icon">💰</div>
							<div class="summary-content">
								<div class="summary-label">Spent Today</div>
								<div class="summary-value">{formatCurrency(todaysSpent)}</div>
							</div>
						</div>

						{#if todaysDrinks.length > 0}
							<div class="today-summary-item">
								<div class="summary-icon">⭐</div>
								<div class="summary-content">
									<div class="summary-label">Today's Avg Rating</div>
									<div class="summary-value">
										{(
											todaysDrinks.reduce((sum, drink) => sum + drink.rating, 0) /
											todaysDrinks.length
										).toFixed(1)}
									</div>
								</div>
							</div>
						{:else}
							<div class="empty-today-summary">
								<div class="empty-icon">😴</div>
								<p class="empty-text">No drinks logged today</p>
								<a href="/drinks/add" class="metal-button-ghost">Add your first drink today</a>
							</div>
						{/if}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

<style>
	/* Metal Cards */
	.metal-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #2d3748;
		box-shadow:
			0 16px 64px rgba(0, 0, 0, 0.4),
			0 8px 32px rgba(0, 0, 0, 0.3),
			0 4px 16px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.metal-header {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-bottom: 1px solid #374151;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.metal-icon {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
		border: 1px solid #374151;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Drink Items */
	.metal-drink-item {
		display: flex;
		align-items: center;
		justify-content: between;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid #374151;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
	}

	.metal-drink-item:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		transform: translateY(-1px);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Badges */
	.metal-badge {
		border: 1px solid #374151;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Metal Buttons */
	.metal-button-primary {
		display: inline-flex;
		align-items: center;
		padding: 12px 24px;
		border-radius: 8px;
		background: linear-gradient(135deg, #16a34a 0%, #15803d 30%, #14532d 70%, #15803d 100%);
		color: white;
		border: 1px solid #14532d;
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
	}

	.metal-button-primary:hover {
		background: linear-gradient(135deg, #15803d 0%, #14532d 30%, #0f172a 70%, #14532d 100%);
		transform: translateY(-1px);
		box-shadow:
			0 6px 12px rgba(21, 128, 61, 0.5),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.metal-button-secondary {
		display: inline-flex;
		align-items: center;
		padding: 8px 16px;
		border-radius: 6px;
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
	}

	.metal-button-secondary:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-button-ghost {
		display: inline-flex;
		align-items: center;
		padding: 6px 12px;
		border-radius: 6px;
		background: transparent;
		color: #d1d5db;
		border: 1px solid transparent;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: all 0.2s ease;
	}

	.metal-button-ghost:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #374151;
		color: white;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Quick Action Buttons */
	.metal-quick-action-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 16px 12px;
		border-radius: 8px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.03) 100%
		);
		border: 1px solid #374151;
		text-decoration: none;
		color: white;
		transition: all 0.3s ease;
		min-height: 80px;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.metal-quick-action-button:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 100%
		);
		transform: translateY(-2px);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.action-icon {
		font-size: 24px;
		margin-bottom: 8px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.action-text {
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Today's Summary */
	.today-summary-item {
		display: flex;
		align-items: center;
		padding: 12px;
		border-radius: 8px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.summary-icon {
		font-size: 20px;
		margin-right: 12px;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
	}

	.summary-content {
		flex: 1;
	}

	.summary-label {
		font-size: 14px;
		color: #d1d5db;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.summary-value {
		font-size: 18px;
		font-weight: 600;
		color: white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.empty-today-summary {
		text-align: center;
		padding: 24px 16px;
	}

	.empty-icon {
		font-size: 32px;
		margin-bottom: 12px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.empty-text {
		color: #9ca3af;
		margin-bottom: 16px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Today's Summary Skeleton */
	.today-summary-skeleton {
		display: flex;
		align-items: center;
		padding: 12px;
		border-radius: 8px;
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	.skeleton-stat {
		width: 160px;
		height: 24px;
	}

	/* Skeuomorphic Loading States */
	.skeuomorphic-loader {
		position: relative;
		border-radius: 6px;
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.2) 100%);
		border: 1px solid rgba(255, 255, 255, 0.05);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		overflow: hidden;
		height: 32px;
		width: 120px;
	}

	.loading-shimmer {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 20%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 80%,
			transparent 100%
		);
		animation: shimmer 2s infinite ease-in-out;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	/* Loading pulse animation for icons */
	.loading-pulse {
		animation: pulse 2s infinite ease-in-out;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.6;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.1);
		}
	}

	/* Skeleton loaders for different elements */
	.skeleton-title {
		width: 180px;
		height: 20px;
	}

	.skeleton-badge {
		width: 60px;
		height: 20px;
		border-radius: 12px;
	}

	.skeleton-text {
		width: 80px;
		height: 16px;
	}

	.skeleton-price {
		width: 60px;
		height: 18px;
	}

	.skeleton-rating {
		width: 50px;
		height: 16px;
	}

	/* Metal drink item skeleton */
	.metal-drink-item-skeleton {
		display: flex;
		align-items: center;
		justify-content: between;
		padding: 16px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 1px 0 rgba(255, 255, 255, 0.02);
	}

	/* Enhanced loading effects */
	.skeuomorphic-loader::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border-radius: 6px 6px 0 0;
		pointer-events: none;
	}

	/* Dark mode adjustments */
	:global(.dark) .metal-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border: 1px solid #1f2937;
	}

	:global(.dark) .skeuomorphic-loader {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%);
		border: 1px solid rgba(255, 255, 255, 0.02);
	}
</style>
