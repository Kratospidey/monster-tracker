<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { DrinkService } from '$lib/services/drink.service';
	import { DRINK_SERIES, type DrinkFormData, type DrinkSeries, type Drink } from '$lib/types/drink';

	let drinkService = new DrinkService();
	let loading = false;
	let loadingDrink = true;
	let errors: Record<string, string> = {};
	let drinkId: string;
	let originalDrink: Drink | null = null;

	// Form data
	let formData: DrinkFormData = {
		name: '',
		series: 'Normal',
		volume_ml: 500,
		cost: 0,
		rating: 1,
		notes: '',
		created_at: ''
	};

	// Recent drink names for autocomplete
	let recentNames: string[] = [];
	let showNameSuggestions = false;

	onMount(async () => {
		drinkId = $page.params.id;
		await loadDrink();
		await loadRecentNames();
	});

	async function loadDrink() {
		try {
			loadingDrink = true;
			originalDrink = await drinkService.getDrinkById(drinkId);

			if (!originalDrink) {
				alert('Drink not found');
				goto('/drinks');
				return;
			}

			// Populate form with existing data
			formData = {
				name: originalDrink.name,
				series: originalDrink.series as DrinkSeries,
				volume_ml: originalDrink.volume_ml,
				cost: originalDrink.cost,
				rating: originalDrink.rating,
				notes: originalDrink.notes || '',
				created_at: originalDrink.created_at.split('T')[0] // Extract date part
			};
		} catch (e) {
			alert('Failed to load drink: ' + (e instanceof Error ? e.message : 'Unknown error'));
			goto('/drinks');
		} finally {
			loadingDrink = false;
		}
	}

	async function loadRecentNames() {
		try {
			const recentDrinks = await drinkService.getRecentDrinks(10);
			recentNames = [...new Set(recentDrinks.map((drink) => drink.name))];
		} catch (e) {
			// Silent fail for autocomplete
		}
	}

	function validateForm(): boolean {
		errors = {};

		if (!formData.name.trim()) {
			errors.name = 'Name is required';
		}

		if (!formData.series) {
			errors.series = 'Series is required';
		}

		if (!formData.volume_ml || formData.volume_ml <= 0) {
			errors.volume_ml = 'Volume must be greater than 0';
		}

		if (!formData.cost || formData.cost < 0) {
			errors.cost = 'Cost must be 0 or greater';
		}

		if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
			errors.rating = 'Rating must be between 1 and 5';
		}

		if (!formData.created_at) {
			errors.created_at = 'Date is required';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		try {
			loading = true;
			await drinkService.updateDrink(drinkId, formData);
			goto('/drinks');
		} catch (e) {
			alert('Failed to update drink: ' + (e instanceof Error ? e.message : 'Unknown error'));
		} finally {
			loading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Are you sure you want to delete this drink? This action cannot be undone.')) {
			return;
		}

		try {
			loading = true;
			await drinkService.deleteDrink(drinkId);
			goto('/drinks');
		} catch (e) {
			alert('Failed to delete drink: ' + (e instanceof Error ? e.message : 'Unknown error'));
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/drinks');
	}

	function handleNameInput() {
		showNameSuggestions = formData.name.length > 0 && recentNames.length > 0;
	}

	function selectName(name: string) {
		formData.name = name;
		showNameSuggestions = false;
	}

	function handleSeriesChange(value: any) {
		formData.series = value.value as DrinkSeries;
	}
</script>

<svelte:head>
	<title>Edit Drink - Monster Tracker</title>
</svelte:head>

{#if loadingDrink}
	<div class="flex items-center justify-center py-12">
		<div class="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
		<span class="text-muted-foreground ml-2">Loading drink...</span>
	</div>
{:else}
	<div class="mx-auto max-w-2xl space-y-6">
		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<Button variant="ghost" size="icon" on:click={handleCancel}>
					<span class="text-lg">←</span>
				</Button>
				<div>
					<h1 class="text-foreground text-2xl font-bold">Edit Drink</h1>
					<p class="text-muted-foreground">Update your Monster consumption record</p>
				</div>
			</div>

			<!-- Delete Button -->
			<Button
				variant="outline"
				size="icon"
				on:click={handleDelete}
				disabled={loading}
				class="text-red-600 hover:bg-red-50 hover:text-red-700"
			>
				<span class="text-lg">🗑️</span>
			</Button>
		</div>

		<!-- Form -->
		<Card>
			<CardHeader>
				<CardTitle>Drink Details</CardTitle>
			</CardHeader>
			<CardContent class="space-y-6">
				<form on:submit|preventDefault={handleSubmit}>
					<!-- Date Picker -->
					<div class="space-y-2">
						<Label for="date">Date</Label>
						<Input
							id="date"
							type="date"
							bind:value={formData.created_at}
							class={errors.created_at ? 'border-red-500' : ''}
							required
						/>
						{#if errors.created_at}
							<p class="text-sm text-red-500">{errors.created_at}</p>
						{/if}
					</div>

					<!-- Name with Autocomplete -->
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<div class="relative">
							<Input
								id="name"
								type="text"
								placeholder="e.g., Monster Ultra Violet"
								bind:value={formData.name}
								on:input={handleNameInput}
								on:focus={handleNameInput}
								on:blur={() => setTimeout(() => (showNameSuggestions = false), 200)}
								class={errors.name ? 'border-red-500' : ''}
								required
							/>

							<!-- Autocomplete Dropdown -->
							{#if showNameSuggestions}
								<div
									class="metal-dropdown-blur absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md shadow-lg"
								>
									{#each recentNames
										.filter((name) => name.toLowerCase().includes(formData.name.toLowerCase()))
										.slice(0, 5) as name}
										<button
											type="button"
											class="metal-dropdown-item w-full px-4 py-2 text-left transition-colors hover:bg-white/10"
											on:click={() => selectName(name)}
										>
											{name}
										</button>
									{/each}
								</div>
							{/if}
						</div>
						{#if errors.name}
							<p class="text-sm text-red-500">{errors.name}</p>
						{/if}
					</div>

					<!-- Series Select -->
					<div class="space-y-2">
						<Label for="series">Series</Label>
						<Select.Root
							selected={{ value: formData.series, label: formData.series }}
							onSelectedChange={handleSeriesChange}
						>
							<Select.Trigger class={errors.series ? 'border-red-500' : ''}>
								<Select.Value placeholder="Select a series" />
							</Select.Trigger>
							<Select.Content>
								<Select.Group>
									{#each DRINK_SERIES as series}
										<Select.Item value={series} label={series}>
											{series}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						{#if errors.series}
							<p class="text-sm text-red-500">{errors.series}</p>
						{/if}
					</div>

					<!-- Volume -->
					<div class="space-y-2">
						<Label for="volume">Volume (ml)</Label>
						<Input
							id="volume"
							type="number"
							min="1"
							step="1"
							placeholder="500"
							bind:value={formData.volume_ml}
							class={errors.volume_ml ? 'border-red-500' : ''}
							required
						/>
						{#if errors.volume_ml}
							<p class="text-sm text-red-500">{errors.volume_ml}</p>
						{/if}
					</div>

					<!-- Cost -->
					<div class="space-y-2">
						<Label for="cost">Cost (₹)</Label>
						<Input
							id="cost"
							type="number"
							min="0"
							step="0.01"
							placeholder="2.50"
							bind:value={formData.cost}
							class={errors.cost ? 'border-red-500' : ''}
							required
						/>
						{#if errors.cost}
							<p class="text-sm text-red-500">{errors.cost}</p>
						{/if}
					</div>

					<!-- Rating -->
					<div class="space-y-2">
						<Label for="rating">Rating</Label>
						<div class="flex items-center space-x-2">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									type="button"
									class="text-2xl transition-colors {formData.rating >= star
										? 'text-yellow-400'
										: 'text-gray-300'} hover:text-yellow-400"
									on:click={() => (formData.rating = star)}
								>
									⭐
								</button>
							{/each}
							<span class="text-muted-foreground ml-2 text-sm">
								{formData.rating}/5
							</span>
						</div>
						{#if errors.rating}
							<p class="text-sm text-red-500">{errors.rating}</p>
						{/if}
					</div>

					<!-- Notes -->
					<div class="space-y-2">
						<Label for="notes">Notes (optional)</Label>
						<Textarea
							id="notes"
							placeholder="How did it taste? Any thoughts?"
							bind:value={formData.notes}
							rows={3}
						/>
					</div>

					<!-- Form Actions -->
					<div class="flex flex-col space-y-2 pt-4 sm:flex-row sm:space-y-0 sm:space-x-2">
						<Button type="submit" class="flex-1" disabled={loading}>
							{loading ? 'Updating...' : 'Update Drink'}
						</Button>
						<Button
							type="button"
							variant="outline"
							class="flex-1"
							on:click={handleCancel}
							disabled={loading}
						>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	</div>
{/if}

<style>
	/* Metal Dropdowns */
	.metal-dropdown-blur {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
		border: 2px solid #2d3748;
		border-top-color: #4a5568;
		border-left-color: #4a5568;
		border-right-color: #1a202c;
		border-bottom-color: #1a202c;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset -1px 0 0 rgba(255, 255, 255, 0.05),
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.metal-dropdown-item {
		border: none;
		background: transparent;
		color: white;
		transition: all 0.2s ease;
	}

	.metal-dropdown-item:hover {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}
</style>
