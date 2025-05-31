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
		return `metal-badge series-badge-wrapper inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white`;
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

<div class="dashboard-container space-y-8">
	<!-- Stats Panel -->
	<div class="stats-grid grid grid-cols-1 gap-6 sm:grid-cols-3">
		<!-- Total Spent Card -->
		<Card class="metal-card glossy-card">
			<div class="card-glossy-reflection"></div>
			<CardContent class="flex items-center p-8">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-12 w-12 items-center justify-center rounded-xl">
						<div class="icon-glossy-reflection"></div>
						<span class="icon-emoji text-2xl drop-shadow-lg">💰</span>
					</div>
				</div>
				<div class="ml-6 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow-md">Total Spent</dt>
						<dd class="text-3xl font-bold text-white drop-shadow-lg">
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
		<Card class="metal-card glossy-card">
			<div class="card-glossy-reflection"></div>
			<CardContent class="flex items-center p-8">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-12 w-12 items-center justify-center rounded-xl">
						<div class="icon-glossy-reflection"></div>
						<span class="icon-emoji text-2xl drop-shadow-lg">🥤</span>
					</div>
				</div>
				<div class="ml-6 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow-md">Total Cans</dt>
						<dd class="text-3xl font-bold text-white drop-shadow-lg">
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
		<Card class="metal-card glossy-card">
			<div class="card-glossy-reflection"></div>
			<CardContent class="flex items-center p-8">
				<div class="flex-shrink-0">
					<div class="metal-icon flex h-12 w-12 items-center justify-center rounded-xl">
						<div class="icon-glossy-reflection"></div>
						<span class="icon-emoji text-2xl drop-shadow-lg">⭐</span>
					</div>
				</div>
				<div class="ml-6 w-0 flex-1">
					<dl>
						<dt class="truncate text-sm font-medium text-gray-300 drop-shadow-md">
							Average Rating
						</dt>
						<dd class="text-3xl font-bold text-white drop-shadow-lg">
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
	<div class="quick-add-section hidden justify-end md:flex">
		<a href="/drinks/add" class="metal-button-primary glossy-button">
			<div class="button-glossy-reflection"></div>
			<span class="mr-2 drop-shadow-md">+</span>
			<span class="drop-shadow-md">Add Drink</span>
		</a>
	</div>

	<!-- Recent Drinks Section -->
	<Card class="metal-card glossy-card">
		<div class="card-glossy-reflection"></div>
		<CardHeader class="metal-header glossy-header">
			<div class="header-glossy-reflection"></div>
			<CardTitle class="flex items-center justify-between">
				<span class="text-white drop-shadow-lg">Recent Drinks</span>
				<a href="/drinks" class="metal-button-secondary glossy-button">
					<div class="button-glossy-reflection"></div>
					View All
				</a>
			</CardTitle>
		</CardHeader>
		<CardContent class="content-padding">
			{#if loading}
				<div class="py-10">
					<div class="space-y-6">
						{#each Array(3) as _, i}
							<div class="metal-drink-item-skeleton">
								<div class="flex-1">
									<div class="space-y-3">
										<div class="skeuomorphic-loader skeleton-title">
											<div class="loading-shimmer"></div>
										</div>
										<div class="flex space-x-3">
											<div class="skeuomorphic-loader skeleton-badge">
												<div class="loading-shimmer"></div>
											</div>
											<div class="skeuomorphic-loader skeleton-text">
												<div class="loading-shimmer"></div>
											</div>
										</div>
									</div>
								</div>
								<div class="space-y-3">
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
					<div class="mt-6 text-center">
						<div class="inline-flex items-center space-x-3 text-gray-300">
							<div class="loading-pulse">⚡</div>
							<span class="drop-shadow-md">Loading your drinks...</span>
						</div>
					</div>
				</div>
			{:else if error}
				<div class="py-10 text-center">
					<div class="mb-3 text-red-400 drop-shadow-md">⚠️ Error loading data</div>
					<p class="text-gray-300 drop-shadow-md">{error}</p>
				</div>
			{:else if recentDrinks.length === 0}
				<div class="py-12 text-center">
					<div class="mb-6 text-gray-300">
						<span class="text-5xl drop-shadow-lg">🥤</span>
					</div>
					<h3 class="mb-3 text-lg font-medium text-white drop-shadow-md">No drinks logged yet</h3>
					<p class="mb-6 text-gray-300 drop-shadow-md">Start tracking your Monster consumption!</p>
					<a href="/drinks/add" class="metal-button-primary glossy-button">
						<div class="button-glossy-reflection"></div>
						Add Your First Drink
					</a>
				</div>
			{:else}
				<div class="space-y-5">
					{#each recentDrinks as drink}
						<div class="metal-drink-item glossy-item">
							<div class="item-glossy-reflection"></div>
							<div class="flex-1">
								<div class="flex items-center space-x-4">
									<div>
										<h4 class="font-medium text-white drop-shadow-md">{drink.name}</h4>
										<div class="mt-2 flex items-center space-x-3">
											<span
												class={getSeriesBadgeClass(drink.series)}
												style="background: linear-gradient(135deg, {getSeriesColor(
													drink.series
												)}CC, {getSeriesColor(drink.series)}AA)"
											>
												<div class="badge-glossy-reflection"></div>
												{drink.series}
											</span>
											<span class="text-sm text-gray-300 drop-shadow-md">
												{drink.volume_ml}ml
											</span>
											<span class="text-sm text-gray-300 drop-shadow-md">•</span>
											<span class="text-sm text-gray-300 drop-shadow-md">
												{formatDateTime(drink.consumed_at)}
											</span>
										</div>
									</div>
								</div>
							</div>
							<div class="flex items-center space-x-5">
								<div class="text-right">
									<div class="font-semibold text-white drop-shadow-md">
										{formatCurrency(drink.cost)}
									</div>
									<div class="flex items-center text-sm text-gray-300 drop-shadow-md">
										<span class="mr-1">⭐</span>
										<span>{drink.rating}/5</span>
									</div>
								</div>
								<a href="/drinks/{drink.id}/edit" class="metal-button-ghost glossy-button">
									<div class="button-glossy-reflection"></div>
									Edit
								</a>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>

	<!-- Quick Actions & Daily Summary Section -->
	<div class="bottom-section grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Quick Actions -->
		<Card class="metal-card glossy-card">
			<div class="card-glossy-reflection"></div>
			<CardHeader class="metal-header glossy-header">
				<div class="header-glossy-reflection"></div>
				<CardTitle class="text-white drop-shadow-lg">Quick Actions</CardTitle>
			</CardHeader>
			<CardContent class="content-padding space-y-6">
				<div class="grid grid-cols-2 gap-4">
					<a href="/drinks/add" class="metal-quick-action-button glossy-action">
						<div class="action-glossy-reflection"></div>
						<div class="action-icon">➕</div>
						<span class="action-text">Add Drink</span>
					</a>
					<a href="/charts" class="metal-quick-action-button glossy-action">
						<div class="action-glossy-reflection"></div>
						<div class="action-icon">📊</div>
						<span class="action-text">Analytics</span>
					</a>
					<a href="/library" class="metal-quick-action-button glossy-action">
						<div class="action-glossy-reflection"></div>
						<div class="action-icon">📚</div>
						<span class="action-text">Library</span>
					</a>
					<a href="/drinks" class="metal-quick-action-button glossy-action">
						<div class="action-glossy-reflection"></div>
						<div class="action-icon">🥤</div>
						<span class="action-text">All Drinks</span>
					</a>
				</div>
			</CardContent>
		</Card>

		<!-- Today's Summary -->
		<Card class="metal-card glossy-card">
			<div class="card-glossy-reflection"></div>
			<CardHeader class="metal-header glossy-header">
				<div class="header-glossy-reflection"></div>
				<CardTitle class="text-white drop-shadow-lg">Today's Summary</CardTitle>
			</CardHeader>
			<CardContent class="content-padding">
				{#if loading}
					<div class="space-y-5">
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

					<div class="space-y-5">
						<div class="today-summary-item glossy-summary">
							<div class="summary-glossy-reflection"></div>
							<div class="summary-icon">🥤</div>
							<div class="summary-content">
								<div class="summary-label">Drinks Today</div>
								<div class="summary-value">{todaysDrinks.length}</div>
							</div>
						</div>

						<div class="today-summary-item glossy-summary">
							<div class="summary-glossy-reflection"></div>
							<div class="summary-icon">💰</div>
							<div class="summary-content">
								<div class="summary-label">Spent Today</div>
								<div class="summary-value">{formatCurrency(todaysSpent)}</div>
							</div>
						</div>

						{#if todaysDrinks.length > 0}
							<div class="today-summary-item glossy-summary">
								<div class="summary-glossy-reflection"></div>
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
								<a href="/drinks/add" class="metal-button-ghost glossy-button">
									<div class="button-glossy-reflection"></div>
									Add your first drink today
								</a>
							</div>
						{/if}
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

<style>
	/* Dashboard Container */
	.dashboard-container {
		padding: 0 4px;
		max-width: 1400px;
		margin: 0 auto;
	}

	.stats-grid {
		margin-bottom: 2rem;
	}

	.quick-add-section {
		margin-bottom: 1rem;
	}

	.bottom-section {
		margin-top: 2rem;
	}

	.content-padding {
		padding: 1.5rem 1.75rem;
	}

	/* Enhanced Metal Cards with Dynamic Glossy Effects */
	.metal-card {
		position: relative;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 16px;
		box-shadow:
			0 20px 80px rgba(0, 0, 0, 0.5),
			0 12px 48px rgba(0, 0, 0, 0.4),
			0 6px 24px rgba(0, 0, 0, 0.3),
			inset 0 2px 0 rgba(255, 255, 255, 0.25),
			0 2px 0 rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.glossy-card:hover {
		transform: translateY(-2px) scale(1.002);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow:
			0 25px 100px rgba(0, 0, 0, 0.6),
			0 15px 60px rgba(0, 0, 0, 0.5),
			0 8px 32px rgba(0, 0, 0, 0.4),
			inset 0 2px 0 rgba(255, 255, 255, 0.35),
			0 2px 0 rgba(255, 255, 255, 0.25);
	}

	/* Glossy Reflection Effects */
	.card-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 40%,
			rgba(255, 255, 255, 0.02) 80%,
			transparent 100%
		);
		border-radius: 16px 16px 0 0;
		pointer-events: none;
		opacity: 0.7;
		transition: opacity 0.4s ease;
	}

	.glossy-card:hover .card-glossy-reflection {
		opacity: 1;
	}

	/* Enhanced Metal Headers */
	.metal-header {
		position: relative;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 16px 16px 0 0;
		overflow: hidden;
		box-shadow:
			inset 0 2px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.header-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 60%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		pointer-events: none;
		opacity: 0.8;
		transition: opacity 0.3s ease;
	}

	.glossy-header:hover .header-glossy-reflection {
		opacity: 1;
	}

	/* Enhanced Metal Icons */
	.metal-icon {
		position: relative;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.25) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.3),
			0 3px 8px rgba(0, 0, 0, 0.2),
			inset 0 2px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.2);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.icon-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: inherit;
		pointer-events: none;
		opacity: 0.8;
		transition: opacity 0.3s ease;
	}

	.metal-icon:hover {
		transform: scale(1.05);
		box-shadow:
			0 8px 20px rgba(0, 0, 0, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			inset 0 2px 0 rgba(255, 255, 255, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.metal-icon:hover .icon-glossy-reflection {
		opacity: 1;
	}

	.icon-emoji {
		position: relative;
		z-index: 2;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
	}

	/* Enhanced Metal Drink Items */
	.metal-drink-item {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: between;
		padding: 20px 24px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.04) 50%,
			rgba(255, 255, 255, 0.02) 100%
		);
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.3),
			0 3px 10px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.08);
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.glossy-item:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		transform: translateY(-2px) scale(1.01);
		border: 1px solid rgba(255, 255, 255, 0.25);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.4),
			0 5px 15px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.item-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 60%,
			transparent 100%
		);
		border-radius: 12px 12px 0 0;
		pointer-events: none;
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	.glossy-item:hover .item-glossy-reflection {
		opacity: 1;
	}

	/* Series Badge Glossy Effects */
	.series-badge-wrapper {
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.2);
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 3px 8px rgba(0, 0, 0, 0.3),
			0 1px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.badge-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: inherit;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.series-badge-wrapper:hover {
		transform: scale(1.05);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.4),
			0 2px 6px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.series-badge-wrapper:hover .badge-glossy-reflection {
		opacity: 1;
	}

	/* Enhanced Metal Buttons */
	.metal-button-primary {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 14px 28px;
		border-radius: 10px;
		background: linear-gradient(
			135deg,
			#16a34a 0%,
			#15803d 25%,
			#14532d 50%,
			#15803d 75%,
			#16a34a 100%
		);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 16px;
		font-weight: 600;
		text-decoration: none;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 8px 24px rgba(22, 163, 74, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 2px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.2);
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.metal-button-primary:hover {
		background: linear-gradient(
			135deg,
			#15803d 0%,
			#14532d 25%,
			#0f172a 50%,
			#14532d 75%,
			#15803d 100%
		);
		transform: translateY(-2px) scale(1.02);
		box-shadow:
			0 12px 36px rgba(22, 163, 74, 0.5),
			0 6px 18px rgba(0, 0, 0, 0.4),
			0 3px 9px rgba(0, 0, 0, 0.3),
			inset 0 2px 0 rgba(255, 255, 255, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.metal-button-secondary {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 10px 20px;
		border-radius: 8px;
		background: linear-gradient(
			135deg,
			#64748b 0%,
			#475569 25%,
			#334155 50%,
			#475569 75%,
			#64748b 100%
		);
		color: #f8fafc;
		border: 1px solid rgba(255, 255, 255, 0.15);
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.metal-button-secondary:hover {
		background: linear-gradient(
			135deg,
			#475569 0%,
			#334155 25%,
			#1e293b 50%,
			#334155 75%,
			#475569 100%
		);
		transform: translateY(-1px) scale(1.02);
		box-shadow:
			0 6px 18px rgba(0, 0, 0, 0.4),
			0 3px 9px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.metal-button-ghost {
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 8px 16px;
		border-radius: 8px;
		background: transparent;
		color: #d1d5db;
		border: 1px solid transparent;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.metal-button-ghost:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		transform: scale(1.05);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.08);
	}

	/* Button Glossy Reflections */
	.button-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.15) 50%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-radius: inherit;
		pointer-events: none;
		opacity: 0.7;
		transition: opacity 0.3s ease;
	}

	.glossy-button:hover .button-glossy-reflection {
		opacity: 1;
	}

	/* Enhanced Quick Action Buttons */
	.metal-quick-action-button {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20px 16px;
		border-radius: 12px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(255, 255, 255, 0.03) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.15);
		text-decoration: none;
		color: white;
		min-height: 100px;
		overflow: hidden;
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.3),
			0 3px 10px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.08);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.glossy-action:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.06) 100%
		);
		transform: translateY(-3px) scale(1.02);
		border: 1px solid rgba(255, 255, 255, 0.25);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.4),
			0 5px 15px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.action-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.1) 60%,
			transparent 100%
		);
		border-radius: 12px 12px 0 0;
		pointer-events: none;
		opacity: 0.6;
		transition: opacity 0.3s ease;
	}

	.glossy-action:hover .action-glossy-reflection {
		opacity: 1;
	}

	.action-icon {
		position: relative;
		z-index: 2;
		font-size: 28px;
		margin-bottom: 12px;
		filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4));
		transition: transform 0.3s ease;
	}

	.glossy-action:hover .action-icon {
		transform: scale(1.1);
	}

	.action-text {
		position: relative;
		z-index: 2;
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
	}

	/* Enhanced Today's Summary */
	.today-summary-item {
		position: relative;
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-radius: 10px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.04) 50%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.12);
		overflow: hidden;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.08);
		transition: all 0.3s ease;
	}

	.glossy-summary:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			rgba(255, 255, 255, 0.04) 100%
		);
		transform: translateY(-1px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 6px 18px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.12);
	}

	.summary-glossy-reflection {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 40%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 70%,
			transparent 100%
		);
		border-radius: 10px 10px 0 0;
		pointer-events: none;
		opacity: 0.5;
		transition: opacity 0.3s ease;
	}

	.glossy-summary:hover .summary-glossy-reflection {
		opacity: 1;
	}

	.summary-icon {
		position: relative;
		z-index: 2;
		font-size: 24px;
		margin-right: 16px;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
		transition: transform 0.3s ease;
	}

	.glossy-summary:hover .summary-icon {
		transform: scale(1.1);
	}

	.summary-content {
		position: relative;
		z-index: 2;
		flex: 1;
	}

	.summary-label {
		font-size: 14px;
		color: #d1d5db;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
	}

	.summary-value {
		font-size: 20px;
		font-weight: 600;
		color: white;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
		margin-top: 2px;
	}

	.empty-today-summary {
		text-align: center;
		padding: 32px 20px;
	}

	.empty-icon {
		font-size: 40px;
		margin-bottom: 16px;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
	}

	.empty-text {
		color: #9ca3af;
		margin-bottom: 20px;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
		font-size: 16px;
	}

	/* Enhanced Skeuomorphic Loading States */
	.skeuomorphic-loader {
		position: relative;
		border-radius: 8px;
		background: linear-gradient(
			145deg,
			rgba(0, 0, 0, 0.4) 0%,
			rgba(0, 0, 0, 0.2) 50%,
			rgba(0, 0, 0, 0.3) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.5),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		overflow: hidden;
		height: 36px;
		width: 140px;
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
			rgba(255, 255, 255, 0.15) 25%,
			rgba(255, 255, 255, 0.25) 50%,
			rgba(255, 255, 255, 0.15) 75%,
			transparent 100%
		);
		animation: shimmer 2.5s infinite ease-in-out;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.loading-pulse {
		animation: pulse 2s infinite ease-in-out;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	/* Enhanced Skeleton Loaders */
	.skeleton-title {
		width: 200px;
		height: 24px;
	}

	.skeleton-badge {
		width: 70px;
		height: 22px;
		border-radius: 14px;
	}

	.skeleton-text {
		width: 90px;
		height: 18px;
	}

	.skeleton-price {
		width: 70px;
		height: 20px;
	}

	.skeleton-rating {
		width: 60px;
		height: 18px;
	}

	.skeleton-stat {
		width: 180px;
		height: 28px;
	}

	/* Enhanced Metal Drink Item Skeleton */
	.metal-drink-item-skeleton {
		display: flex;
		align-items: center;
		justify-content: between;
		padding: 20px 24px;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: linear-gradient(
			145deg,
			rgba(0, 0, 0, 0.3) 0%,
			rgba(0, 0, 0, 0.15) 50%,
			rgba(0, 0, 0, 0.2) 100%
		);
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 1px 0 rgba(255, 255, 255, 0.03);
	}

	.today-summary-skeleton {
		display: flex;
		align-items: center;
		padding: 16px 20px;
		border-radius: 10px;
		background: linear-gradient(
			145deg,
			rgba(0, 0, 0, 0.25) 0%,
			rgba(0, 0, 0, 0.12) 50%,
			rgba(0, 0, 0, 0.18) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}

	/* Enhanced Loading Effects */
	.skeuomorphic-loader::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.03) 100%
		);
		border-radius: 8px 8px 0 0;
		pointer-events: none;
	}

	/* Responsive Adjustments */
	@media (max-width: 768px) {
		.dashboard-container {
			padding: 0 2px;
		}

		.content-padding {
			padding: 1.25rem 1.5rem;
		}

		.metal-card {
			border-radius: 12px;
		}

		.stats-grid {
			gap: 1rem;
		}

		.bottom-section {
			gap: 1.5rem;
		}

		.metal-quick-action-button {
			min-height: 85px;
			padding: 16px 12px;
		}

		.action-icon {
			font-size: 24px;
			margin-bottom: 8px;
		}
	}

	/* Dark mode enhancements */
	:global(.dark) .metal-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.04) 50%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	:global(.dark) .skeuomorphic-loader {
		background: linear-gradient(
			145deg,
			rgba(0, 0, 0, 0.6) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.4) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.03);
	}
</style>
