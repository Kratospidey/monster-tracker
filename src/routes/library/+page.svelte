<script lang="ts">
	import { onMount } from 'svelte';
	import { LibraryService, type CanLibraryItem } from '$lib/services/library.service';
	import CanCard from '$lib/components/CanCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';

	let cans: CanLibraryItem[] = [];
	let filteredCans: CanLibraryItem[] = [];
	let existingCanTypes: Array<{ name: string; series: string }> = [];
	let loading = true;
	let searchTerm = '';
	let selectedSeries = { value: 'all', label: 'All Series' };
	let sortBy = { value: 'count', label: 'Most Purchased' };
	let sortOrder = { value: 'desc', label: 'Descending' };
	let stats = { uniqueCans: 0, totalCans: 0, totalSpent: 0, cansWithImages: 0 };

	const sortOptions = [
		{ value: 'count', label: 'Most Purchased' },
		{ value: 'totalSpent', label: 'Highest Spending' },
		{ value: 'name', label: 'Name' },
		{ value: 'averageRating', label: 'Highest Rated' },
		{ value: 'lastPurchased', label: 'Recently Purchased' }
	];

	const seriesOptions = [
		{ value: 'all', label: 'All Series' },
		{ value: 'Normal', label: 'Normal' },
		{ value: 'Ultra', label: 'Ultra' },
		{ value: 'Juice', label: 'Juice' },
		{ value: 'Reserve', label: 'Reserve' },
		{ value: 'Special', label: 'Special' }
	];

	onMount(async () => {
		await loadLibrary();
	});

	async function loadLibrary() {
		try {
			loading = true;
			// Load both cans and existing can types
			const [cansData, canTypesData] = await Promise.all([
				LibraryService.getCanLibrary(),
				LibraryService.getExistingCanTypes()
			]);

			cans = cansData;
			existingCanTypes = canTypesData;
			applyFilters();
		} catch (error) {
			toast.error('Failed to load library: ' + error);
			console.error('Library load error:', error);
		} finally {
			loading = false;
		}
	}

	function applyFilters() {
		let filtered = [...cans];

		// Apply search filter
		if (searchTerm.trim()) {
			const search = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(can) =>
					can.name.toLowerCase().includes(search) || can.series.toLowerCase().includes(search)
			);
		}

		// Apply series filter
		if (selectedSeries.value !== 'all') {
			filtered = filtered.filter((can) => can.series === selectedSeries.value);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aVal, bVal;

			switch (sortBy.value) {
				case 'name':
					aVal = a.name.toLowerCase();
					bVal = b.name.toLowerCase();
					break;
				case 'totalSpent':
					aVal = a.totalSpent;
					bVal = b.totalSpent;
					break;
				case 'averageRating':
					aVal = a.averageRating;
					bVal = b.averageRating;
					break;
				case 'lastPurchased':
					aVal = new Date(a.lastPurchased).getTime();
					bVal = new Date(b.lastPurchased).getTime();
					break;
				case 'count':
				default:
					aVal = a.count;
					bVal = b.count;
					break;
			}

			if (typeof aVal === 'string' && typeof bVal === 'string') {
				return sortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
			}

			return sortOrder.value === 'asc'
				? (aVal as number) - (bVal as number)
				: (bVal as number) - (aVal as number);
		});

		filteredCans = filtered;
	}

	function getLibraryStats() {
		if (cans.length === 0) {
			return { uniqueCans: 0, totalCans: 0, totalSpent: 0, cansWithImages: 0 };
		}

		const cansWithImages = cans.filter((can) => can.imageUrl).length;
		const totalCans = cans.reduce((sum, can) => sum + can.count, 0);
		const totalSpent = cans.reduce((sum, can) => sum + can.totalSpent, 0);

		return {
			uniqueCans: cans.length,
			totalCans,
			totalSpent,
			cansWithImages
		};
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function handleImageUpdated() {
		// Refresh the library to get updated image URLs
		loadLibrary();
	}

	// Reactive statements to apply filters when dependencies change
	$: if (
		searchTerm !== undefined ||
		selectedSeries !== undefined ||
		sortBy !== undefined ||
		sortOrder !== undefined
	) {
		applyFilters();
	}

	// Make stats reactive to cans array changes
	$: if (cans && cans.length >= 0) {
		stats = getLibraryStats();
	}
</script>

<svelte:head>
	<title>Library - Monster Tracker</title>
</svelte:head>

<div class="metal-background min-h-screen">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="mb-4">
				<h1 class="metal-text text-3xl font-bold text-white drop-shadow-lg">📚 Monster Library</h1>
				<p class="mt-2 text-gray-200">Your complete collection of Monster Energy cans</p>
			</div>

			<!-- Stats -->
			{#if loading}
				<!-- Shimmer loading for stats -->
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
					{#each Array(4) as _}
						<div class="metal-card animate-pulse p-4">
							<div class="space-y-2 text-center">
								<div class="shimmer h-8 rounded-md bg-gray-300"></div>
								<div class="shimmer h-4 rounded-md bg-gray-300"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
					<div class="metal-card border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-white">{stats.uniqueCans}</div>
							<div class="text-sm text-gray-300">Unique Cans</div>
						</div>
					</div>

					<div class="metal-card border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-white">{stats.totalCans}</div>
							<div class="text-sm text-gray-300">Total Purchased</div>
						</div>
					</div>

					<div class="metal-card border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-white">{formatCurrency(stats.totalSpent)}</div>
							<div class="text-sm text-gray-300">Total Spent</div>
						</div>
					</div>

					<div class="metal-card border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 p-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-white">{stats.cansWithImages}</div>
							<div class="text-sm text-gray-300">With Images</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Quick Tip -->
			{#if !loading && stats.uniqueCans > 0 && stats.cansWithImages === 0}
				<div
					class="metal-card mb-6 border-blue-500 p-4"
					style="background: linear-gradient(135deg, rgba(30, 58, 138, 0.8), rgba(30, 64, 175, 0.8))"
				>
					<div class="flex items-center space-x-3">
						<div class="text-2xl">💡</div>
						<div>
							<h3 class="font-semibold text-blue-100">Add images to your cans!</h3>
							<p class="text-sm text-blue-200">
								Click directly on the image area of any can card to upload photos and see them in
								your library.
							</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Filters and Search -->
		{#if loading}
			<!-- Shimmer loading for filters -->
			<div class="metal-card mb-8 animate-pulse p-6">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each Array(4) as _}
						<div class="space-y-2">
							<div class="shimmer h-4 w-16 rounded bg-gray-300"></div>
							<div class="shimmer h-10 rounded-md bg-gray-300"></div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="metal-card mb-8 border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 p-6">
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<!-- Search -->
					<div>
						<label for="search" class="mb-1 block text-sm font-medium text-gray-200">
							Search
						</label>
						<Input
							id="search"
							type="text"
							placeholder="Search cans..."
							bind:value={searchTerm}
							class="border-gray-600 bg-gray-700 text-white placeholder-gray-400"
						/>
					</div>

					<!-- Series Filter -->
					<div>
						<label for="series" class="mb-1 block text-sm font-medium text-gray-200">
							Series
						</label>
						<Select.Root bind:selected={selectedSeries}>
							<Select.Trigger id="series" class="border-gray-600 bg-gray-700 text-white">
								<Select.Value placeholder="All Series" />
							</Select.Trigger>
							<Select.Content class="border-gray-600 bg-gray-800">
								{#each seriesOptions as option}
									<Select.Item value={option.value} class="text-white hover:bg-gray-700"
										>{option.label}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Sort By -->
					<div>
						<label for="sortBy" class="mb-1 block text-sm font-medium text-gray-200">
							Sort By
						</label>
						<Select.Root bind:selected={sortBy}>
							<Select.Trigger id="sortBy" class="border-gray-600 bg-gray-700 text-white">
								<Select.Value placeholder="Sort by..." />
							</Select.Trigger>
							<Select.Content class="border-gray-600 bg-gray-800">
								{#each sortOptions as option}
									<Select.Item value={option.value} class="text-white hover:bg-gray-700"
										>{option.label}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>

					<!-- Sort Order -->
					<div>
						<label for="sortOrder" class="mb-1 block text-sm font-medium text-gray-200">
							Order
						</label>
						<Select.Root bind:selected={sortOrder}>
							<Select.Trigger id="sortOrder" class="border-gray-600 bg-gray-700 text-white">
								<Select.Value placeholder="Order..." />
							</Select.Trigger>
							<Select.Content class="border-gray-600 bg-gray-800">
								<Select.Item value="desc" class="text-white hover:bg-gray-700"
									>Descending</Select.Item
								>
								<Select.Item value="asc" class="text-white hover:bg-gray-700">Ascending</Select.Item
								>
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<!-- Filter Summary -->
				{#if searchTerm || selectedSeries.value !== 'all'}
					<div class="mt-4 flex items-center gap-2">
						<span class="text-sm text-gray-300">Active filters:</span>

						{#if searchTerm}
							<Badge variant="secondary" class="bg-gray-700 text-gray-200">
								Search: {searchTerm}
								<button class="ml-1 hover:text-red-400" on:click={() => (searchTerm = '')}>
									✕
								</button>
							</Badge>
						{/if}

						{#if selectedSeries.value !== 'all'}
							<Badge variant="secondary" class="bg-gray-700 text-gray-200">
								Series: {selectedSeries.label}
								<button
									class="ml-1 hover:text-red-400"
									on:click={() => (selectedSeries = { value: 'all', label: 'All Series' })}
								>
									✕
								</button>
							</Badge>
						{/if}

						<Button
							variant="ghost"
							size="sm"
							class="text-gray-300 hover:bg-gray-700 hover:text-white"
							on:click={() => {
								searchTerm = '';
								selectedSeries = { value: 'all', label: 'All Series' };
							}}
						>
							Clear all
						</Button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Results Info -->
		{#if !loading}
			<div class="mb-6">
				<p class="text-gray-200">
					Showing {filteredCans.length} of {cans.length} cans
				</p>
			</div>
		{/if}

		<!-- Library Grid -->
		{#if loading}
			<!-- Shimmer loading for cards -->
			<div
				class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each Array(8) as _}
					<div class="metal-card animate-pulse p-4">
						<div class="space-y-3">
							<div class="shimmer h-48 rounded-lg bg-gray-300"></div>
							<div class="shimmer h-6 rounded bg-gray-300"></div>
							<div class="shimmer h-4 w-20 rounded bg-gray-300"></div>
							<div class="flex justify-between">
								<div class="shimmer h-4 w-12 rounded bg-gray-300"></div>
								<div class="shimmer h-4 w-16 rounded bg-gray-300"></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else if filteredCans.length === 0}
			<div class="py-12 text-center">
				{#if cans.length === 0}
					<div class="mb-4 text-6xl">📚</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-200">No cans in your library yet</h3>
					<p class="mb-6 text-gray-300">Start by adding some drinks to your collection!</p>
					<Button href="/drinks/add" class="skeumorphic-button text-white"
						>Add Your First Drink</Button
					>
				{:else}
					<div class="mb-4 text-6xl">🔍</div>
					<h3 class="mb-2 text-xl font-semibold text-gray-200">No cans match your filters</h3>
					<p class="text-gray-300">Try adjusting your search or filter criteria</p>
				{/if}
			</div>
		{:else}
			<div
				class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
			>
				{#each filteredCans as can (can.id)}
					<CanCard {can} on:imageUpdated={handleImageUpdated} />
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes shimmer {
		0% {
			background-position: -1000px 0;
		}
		100% {
			background-position: 1000px 0;
		}
	}

	.shimmer {
		background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
		background-size: 1000px 104px;
		animation: shimmer 1.5s infinite linear;
	}
</style>
