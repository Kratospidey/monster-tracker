<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { DrinkService } from '$lib/services/drink.service';
	import type { Drink, DrinkFilters } from '$lib/types/drink';
	import { DRINK_SERIES } from '$lib/types/drink';

	let drinkService = new DrinkService();
	let drinks: Drink[] = [];
	let loading = true;
	let error: string | null = null;

	// Filter state
	let filters: DrinkFilters = {
		search: '',
		series: undefined
	};
	let currentLimit = 20;
	let hasMore = true;

	onMount(async () => {
		await loadDrinks();
	});

	async function loadDrinks(append = false) {
		try {
			loading = true;
			const offset = append ? drinks.length : 0;
			const newDrinks = await drinkService.getAllDrinks(filters, currentLimit, offset);

			if (append) {
				drinks = [...drinks, ...newDrinks];
			} else {
				drinks = newDrinks;
			}

			hasMore = newDrinks.length === currentLimit;
		} catch (e) {
			error = e instanceof Error ? e.message : 'An error occurred';
		} finally {
			loading = false;
		}
	}

	async function handleSearch() {
		await loadDrinks(false);
	}

	async function handleSeriesFilter(series: (typeof DRINK_SERIES)[number] | undefined) {
		filters.series = series;
		await loadDrinks(false);
	}

	async function loadMore() {
		await loadDrinks(true);
	}

	async function deleteDrink(id: string) {
		if (!confirm('Are you sure you want to delete this drink?')) return;

		try {
			await drinkService.deleteDrink(id);
			drinks = drinks.filter((drink) => drink.id !== id);
		} catch (e) {
			alert('Failed to delete drink: ' + (e instanceof Error ? e.message : 'Unknown error'));
		}
	}

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
	<title>Drinks - Monster Tracker</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold text-white drop-shadow-lg">Your Drinks</h1>
			<p class="text-gray-300 drop-shadow">Track and manage your Monster consumption</p>
		</div>
		<div class="mt-4 sm:mt-0">
			<a href="/drinks/add" class="metal-button-primary">
				<span class="mr-2 drop-shadow">+</span>
				<span class="drop-shadow">Add Drink</span>
			</a>
		</div>
	</div>

	<!-- Filters -->
	<Card class="metal-card">
		<CardContent class="p-6">
			<div class="flex flex-col gap-4 sm:flex-row">
				<!-- Search -->
				<div class="flex-1">
					<Input
						type="text"
						placeholder="Search by name..."
						bind:value={filters.search}
						on:input={handleSearch}
						class="metal-input w-full"
					/>
				</div>

				<!-- Series Filter -->
				<div class="flex flex-wrap gap-2">
					<button
						class="metal-filter-button {filters.series === undefined
							? 'metal-filter-active'
							: 'metal-filter-inactive'}"
						on:click={() => handleSeriesFilter(undefined)}
					>
						All
					</button>
					{#each DRINK_SERIES as series}
						<button
							class="metal-filter-button {filters.series === series
								? 'metal-filter-active'
								: 'metal-filter-inactive'}"
							style={filters.series === series
								? `background: linear-gradient(135deg, ${getSeriesColor(series)}CC, ${getSeriesColor(series)}AA); border-color: ${getSeriesColor(series)};`
								: ''}
							on:click={() => handleSeriesFilter(series)}
						>
							{series}
						</button>
					{/each}
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Drinks List -->
	<Card class="metal-card">
		<CardContent class="p-0">
			{#if loading && drinks.length === 0}
				<div class="py-8">
					<div class="space-y-4 p-6">
						{#each Array(5) as _, i}
							<!-- Mobile skeleton -->
							<div class="metal-drink-skeleton-mobile block space-y-3 sm:hidden">
								<div class="flex items-start justify-between">
									<div class="flex-1 space-y-2">
										<div class="skeuomorphic-loader skeleton-drink-title">
											<div class="loading-shimmer"></div>
										</div>
										<div class="flex space-x-2">
											<div class="skeuomorphic-loader skeleton-badge">
												<div class="loading-shimmer"></div>
											</div>
											<div class="skeuomorphic-loader skeleton-volume">
												<div class="loading-shimmer"></div>
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
								<div class="flex items-center justify-between">
									<div class="skeuomorphic-loader skeleton-date">
										<div class="loading-shimmer"></div>
									</div>
									<div class="flex space-x-2">
										<div class="skeuomorphic-loader skeleton-button-small">
											<div class="loading-shimmer"></div>
										</div>
										<div class="skeuomorphic-loader skeleton-button-small">
											<div class="loading-shimmer"></div>
										</div>
									</div>
								</div>
							</div>

							<!-- Desktop skeleton -->
							<div
								class="metal-drink-skeleton-desktop hidden items-center justify-between p-6 sm:flex"
							>
								<div class="grid flex-1 grid-cols-4 items-center gap-4">
									<div class="space-y-1">
										<div class="skeuomorphic-loader skeleton-drink-title">
											<div class="loading-shimmer"></div>
										</div>
										<div class="skeuomorphic-loader skeleton-date">
											<div class="loading-shimmer"></div>
										</div>
									</div>
									<div>
										<div class="skeuomorphic-loader skeleton-badge">
											<div class="loading-shimmer"></div>
										</div>
									</div>
									<div>
										<div class="skeuomorphic-loader skeleton-volume">
											<div class="loading-shimmer"></div>
										</div>
									</div>
									<div class="space-y-1">
										<div class="skeuomorphic-loader skeleton-price ml-auto">
											<div class="loading-shimmer"></div>
										</div>
										<div class="skeuomorphic-loader skeleton-rating ml-auto">
											<div class="loading-shimmer"></div>
										</div>
									</div>
								</div>
								<div class="ml-4 flex items-center space-x-2">
									<div class="skeuomorphic-loader skeleton-button">
										<div class="loading-shimmer"></div>
									</div>
									<div class="skeuomorphic-loader skeleton-button">
										<div class="loading-shimmer"></div>
									</div>
								</div>
							</div>
						{/each}
					</div>
					<div class="border-t border-gray-600 p-6 text-center">
						<div class="inline-flex items-center space-x-2 text-gray-300">
							<div class="loading-pulse">⚡</div>
							<span class="drop-shadow">Loading your drinks...</span>
						</div>
					</div>
				</div>
			{:else if error && drinks.length === 0}
				<div class="py-12 text-center">
					<div class="mb-2 text-red-400 drop-shadow">⚠️ Error loading drinks</div>
					<p class="text-gray-300 drop-shadow">{error}</p>
				</div>
			{:else if drinks.length === 0}
				<div class="py-12 text-center">
					<div class="mb-4 text-gray-300">
						<span class="text-6xl drop-shadow">🥤</span>
					</div>
					<h3 class="mb-2 text-xl font-semibold text-white drop-shadow">No drinks found</h3>
					<p class="mb-6 text-gray-300 drop-shadow">
						{filters.search || filters.series
							? 'Try adjusting your filters or search terms.'
							: 'Start tracking your Monster consumption by adding your first drink!'}
					</p>
					<a href="/drinks/add" class="metal-button-primary">
						<span class="mr-2 drop-shadow">+</span>
						<span class="drop-shadow">Add Your First Drink</span>
					</a>
				</div>
			{:else}
				<div class="divide-y divide-gray-600">
					{#each drinks as drink}
						<!-- Mobile Layout -->
						<div class="metal-drink-item-mobile block space-y-3 p-4 sm:hidden">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="font-semibold text-white drop-shadow">{drink.name}</h3>
									<div class="mt-1 flex items-center space-x-2">
										<span
											class={getSeriesBadgeClass(drink.series)}
											style="background: linear-gradient(135deg, {getSeriesColor(
												drink.series
											)}CC, {getSeriesColor(drink.series)}AA)"
										>
											{drink.series}
										</span>
										<span class="text-sm text-gray-300 drop-shadow">{drink.volume_ml}ml</span>
									</div>
								</div>
								<div class="text-right">
									<div class="font-semibold text-white drop-shadow">
										{formatCurrency(drink.cost)}
									</div>
									<div class="flex items-center text-sm text-gray-300 drop-shadow">
										<span class="mr-1">⭐</span>
										<span>{drink.rating}/5</span>
									</div>
								</div>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm text-gray-300 drop-shadow">{formatDate(drink.created_at)}</span
								>
								<div class="flex space-x-2">
									<a href="/drinks/{drink.id}/edit" class="metal-button-ghost-small">✏️</a>
									<button class="metal-button-ghost-small" on:click={() => deleteDrink(drink.id)}>
										🗑️
									</button>
								</div>
							</div>
						</div>

						<!-- Desktop Layout -->
						<div class="metal-drink-item-desktop hidden items-center justify-between p-6 sm:flex">
							<div class="grid flex-1 grid-cols-4 items-center gap-4">
								<div>
									<h3 class="font-semibold text-white drop-shadow">{drink.name}</h3>
									<span class="text-sm text-gray-300 drop-shadow"
										>{formatDate(drink.created_at)}</span
									>
								</div>
								<div>
									<span
										class={getSeriesBadgeClass(drink.series)}
										style="background: linear-gradient(135deg, {getSeriesColor(
											drink.series
										)}CC, {getSeriesColor(drink.series)}AA)"
									>
										{drink.series}
									</span>
								</div>
								<div class="text-sm text-gray-300 drop-shadow">
									{drink.volume_ml}ml
								</div>
								<div class="text-right">
									<div class="font-semibold text-white drop-shadow">
										{formatCurrency(drink.cost)}
									</div>
									<div class="flex items-center justify-end text-sm text-gray-300 drop-shadow">
										<span class="mr-1">⭐</span>
										<span>{drink.rating}/5</span>
									</div>
								</div>
							</div>
							<div class="ml-4 flex items-center space-x-2">
								<a href="/drinks/{drink.id}/edit" class="metal-button-ghost">✏️ Edit</a>
								<button class="metal-button-ghost" on:click={() => deleteDrink(drink.id)}>
									🗑️ Delete
								</button>
							</div>
						</div>
					{/each}
				</div>

				<!-- Load More Button -->
				{#if hasMore}
					<div class="border-t border-gray-600 p-6 text-center">
						{#if loading}
							<div class="inline-flex items-center space-x-2 text-gray-300">
								<div class="loading-pulse">⚡</div>
								<span class="drop-shadow">Loading more drinks...</span>
							</div>
						{:else}
							<button class="metal-button-secondary" on:click={loadMore}> Load More </button>
						{/if}
					</div>
				{/if}
			{/if}
		</CardContent>
	</Card>
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
			0 12px 48px rgba(0, 0, 0, 0.4),
			0 4px 16px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	/* Metal Inputs */
	.metal-input {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		border: 1px solid #1a202c;
		color: white;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.metal-input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.metal-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 2px rgba(37, 99, 235, 0.3);
	}

	/* Metal Filter Buttons */
	.metal-filter-button {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: all 0.2s ease;
		cursor: pointer;
		border: 1px solid #374151;
	}

	.metal-filter-active {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 30%, #1e40af 70%, #1d4ed8 100%);
		color: #bfdbfe;
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-filter-inactive {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		color: #d1d5db;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.metal-filter-inactive:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.1) 100%
		);
		color: white;
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Drink Items */
	.metal-drink-item-mobile {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.05) 0%,
			rgba(255, 255, 255, 0.02) 100%
		);
		border: none;
		transition: all 0.3s ease;
	}

	.metal-drink-item-desktop {
		background: transparent;
		border: none;
		transition: all 0.3s ease;
	}

	.metal-drink-item-desktop:hover {
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
		justify-content: center;
		padding: 10px 20px;
		border-radius: 6px;
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.metal-button-secondary:hover:not(:disabled) {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-button-secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
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
		cursor: pointer;
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

	.metal-button-ghost-small {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 4px 8px;
		border-radius: 4px;
		background: transparent;
		color: #d1d5db;
		border: 1px solid transparent;
		font-size: 12px;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.metal-button-ghost-small:hover {
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

	/* Skeleton loaders for different drink elements */
	.skeleton-drink-title {
		width: 200px;
		height: 20px;
	}

	.skeleton-badge {
		width: 60px;
		height: 20px;
		border-radius: 12px;
	}

	.skeleton-volume {
		width: 40px;
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

	.skeleton-date {
		width: 100px;
		height: 16px;
	}

	.skeleton-button {
		width: 80px;
		height: 32px;
		border-radius: 6px;
	}

	.skeleton-button-small {
		width: 32px;
		height: 24px;
		border-radius: 4px;
	}

	/* Metal drink item skeletons */
	.metal-drink-skeleton-mobile,
	.metal-drink-skeleton-desktop {
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.05),
			0 1px 0 rgba(255, 255, 255, 0.02);
	}

	/* Dark mode adjustments */
	:global(.dark) .skeuomorphic-loader {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.3) 100%);
		border: 1px solid rgba(255, 255, 255, 0.02);
	}
</style>
