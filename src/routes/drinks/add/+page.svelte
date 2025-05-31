<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { DrinkService } from '$lib/services/drink.service';
	import { DRINK_SERIES, type DrinkFormData, type DrinkSeries } from '$lib/types/drink';
	import { Badge } from '$lib/components/ui/badge';
	import { Separator } from '$lib/components/ui/separator';

	let drinkService = new DrinkService();
	let loading = false;
	let errors: Record<string, string> = {};

	// Form data
	let formData: DrinkFormData = {
		name: '',
		series: 'Normal',
		volume_ml: 500,
		cost: 0,
		rating: 1,
		notes: '',
		created_at: new Date().toISOString().split('T')[0] // Today's date
	};

	// Volume options
	const volumeOptions = [
		{ value: 500, label: '500ml', description: 'Standard Can' },
		{ value: 350, label: '350ml', description: 'Small Can' }
	];

	// Recent drink names for autocomplete (simple implementation)
	let recentNames: string[] = [];
	let showNameSuggestions = false;

	// Dynamic glare effect variables
	let glareX = 50;
	let glareY = 50;

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

		if (!formData.volume_ml || (formData.volume_ml !== 500 && formData.volume_ml !== 350)) {
			errors.volume_ml = 'Please select a valid volume';
		}

		if (!formData.cost || formData.cost < 0) {
			errors.cost = 'Cost must be 0 or greater';
		}

		if (!formData.rating || formData.rating < 0.5 || formData.rating > 5) {
			errors.rating = 'Rating must be between 0.5 and 5';
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
			await drinkService.createDrink(formData);
			goto('/drinks');
		} catch (e) {
			alert('Failed to save drink: ' + (e instanceof Error ? e.message : 'Unknown error'));
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

	function getSeriesInfo(series: string) {
		const seriesInfo = {
			Normal: {
				bg: 'bg-gray-100 dark:bg-gray-800',
				text: 'text-gray-700 dark:text-gray-300',
				border: 'border-gray-300 dark:border-gray-600',
				gradient: 'from-gray-500 to-gray-600',
				color: '#64748b'
			},
			Ultra: {
				bg: 'bg-blue-100 dark:bg-blue-900',
				text: 'text-blue-700 dark:text-blue-300',
				border: 'border-blue-300 dark:border-blue-600',
				gradient: 'from-blue-500 to-blue-600',
				color: '#3b82f6'
			},
			Juice: {
				bg: 'bg-orange-100 dark:bg-orange-900',
				text: 'text-orange-700 dark:text-orange-300',
				border: 'border-orange-300 dark:border-orange-600',
				gradient: 'from-orange-500 to-orange-600',
				color: '#f97316'
			},
			Reserve: {
				bg: 'bg-purple-100 dark:bg-purple-900',
				text: 'text-purple-700 dark:text-purple-300',
				border: 'border-purple-300 dark:border-purple-600',
				gradient: 'from-purple-500 to-purple-600',
				color: '#8b5cf6'
			},
			Special: {
				bg: 'bg-red-100 dark:bg-red-900',
				text: 'text-red-700 dark:text-red-300',
				border: 'border-red-300 dark:border-red-600',
				gradient: 'from-red-500 to-red-600',
				color: '#ef4444'
			}
		};
		return seriesInfo[series as keyof typeof seriesInfo] || seriesInfo['Normal'];
	}

	function getRatingLabel(rating: number) {
		if (rating >= 4.5) return 'Excellent';
		if (rating >= 4) return 'Great';
		if (rating >= 3.5) return 'Good';
		if (rating >= 3) return 'Average';
		if (rating >= 2.5) return 'Below Average';
		if (rating >= 2) return 'Poor';
		if (rating >= 1.5) return 'Very Poor';
		return 'Terrible';
	}

	// Dynamic glare effect
	function handleMouseMove(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		glareX = x;
		glareY = y;

		target.style.setProperty('--glare-x', `${x}%`);
		target.style.setProperty('--glare-y', `${y}%`);
	}

	// Load recent names when component mounts
	loadRecentNames();
</script>

<svelte:head>
	<title>Add Drink - Monster Tracker</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-8 p-6">
	<!-- Header -->
	<div class="flex items-center space-x-4">
		<button
			class="skeumorphic-back-button"
			style="--glare-x: 50%; --glare-y: 50%;"
			on:mousemove={handleMouseMove}
			on:click={handleCancel}
		>
			<span class="back-arrow">←</span>
		</button>
		<div>
			<h1 class="text-2xl font-bold text-white drop-shadow-lg">Add New Drink</h1>
			<p class="text-gray-300 drop-shadow">Track your consumption</p>
		</div>
	</div>

	<!-- Form -->
	<Card
		class="metal-card shadow-2xl"
		style="backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);"
	>
		<CardHeader class="metal-header border-b border-gray-600">
			<CardTitle class="flex items-center gap-3">
				<div class="metal-icon flex h-8 w-8 items-center justify-center rounded-lg">
					<span class="text-lg drop-shadow">🥤</span>
				</div>
				<span class="text-lg font-semibold text-white drop-shadow">Drink Details</span>
			</CardTitle>
		</CardHeader>
		<CardContent class="space-y-8 p-8">
			<form on:submit|preventDefault={handleSubmit}>
				<!-- Date Picker -->
				<div class="space-y-3">
					<Label for="date" class="text-base font-medium text-white drop-shadow">Date</Label>
					<Input
						id="date"
						type="date"
						bind:value={formData.created_at}
						class="metal-input h-11 {errors.created_at
							? 'border-red-400 focus:ring-red-400'
							: 'focus:border-blue-400 focus:ring-blue-400'}"
						required
					/>
					{#if errors.created_at}
						<p class="text-sm text-red-400 drop-shadow">{errors.created_at}</p>
					{/if}
				</div>

				<Separator class="metal-separator my-6" />

				<!-- Name with Autocomplete -->
				<div class="space-y-4">
					<Label for="name" class="text-base font-medium text-white drop-shadow">Drink Name</Label>
					<div class="relative">
						<Input
							id="name"
							type="text"
							placeholder="e.g., Monster Ultra Violet"
							bind:value={formData.name}
							on:input={handleNameInput}
							on:focus={handleNameInput}
							on:blur={() => setTimeout(() => (showNameSuggestions = false), 200)}
							class="metal-input h-11 {errors.name
								? 'border-red-400 focus:ring-red-400'
								: 'focus:border-blue-400 focus:ring-blue-400'}"
							required
						/>

						<!-- Autocomplete Dropdown -->
						{#if showNameSuggestions}
							<div
								class="metal-dropdown-blur absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-lg border border-gray-600 shadow-2xl"
								style="backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);"
							>
								{#each recentNames
									.filter((name) => name.toLowerCase().includes(formData.name.toLowerCase()))
									.slice(0, 5) as name}
									<button
										type="button"
										class="metal-dropdown-item flex w-full items-center gap-2 px-4 py-3 text-left transition-all"
										on:click={() => selectName(name)}
									>
										<span class="text-gray-300">↻</span>
										<span class="text-white">{name}</span>
									</button>
								{/each}
							</div>
						{/if}
					</div>
					{#if errors.name}
						<p class="text-sm text-red-400 drop-shadow">{errors.name}</p>
					{/if}
				</div>

				<!-- Series Select -->
				<div class="space-y-4">
					<Label for="series" class="text-base font-medium text-white drop-shadow">Series</Label>
					<Select.Root
						selected={{ value: formData.series, label: formData.series }}
						onSelectedChange={handleSeriesChange}
					>
						<Select.Trigger
							class="metal-input h-11 {errors.series
								? 'border-red-400 focus:ring-red-400'
								: 'focus:border-blue-400 focus:ring-blue-400'}"
						>
							<Select.Value placeholder="Select a series" />
						</Select.Trigger>
						<Select.Content
							class="metal-dropdown-blur z-50 border border-gray-600 shadow-2xl"
							style="backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);"
							side="bottom"
							align="start"
							sideOffset={4}
							avoidCollisions={true}
						>
							<Select.Group>
								{#each DRINK_SERIES as series}
									<Select.Item
										value={series}
										label={series}
										class="metal-dropdown-item cursor-pointer p-4"
									>
										<div class="flex w-full items-center justify-between">
											<span class="font-medium text-white">{series}</span>
											<div
												class="ml-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-white"
												style="background: linear-gradient(135deg, {getSeriesInfo(series)
													.color}CC, {getSeriesInfo(series).color}AA)"
											>
												{series}
											</div>
										</div>
									</Select.Item>
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>
					{#if errors.series}
						<p class="text-sm text-red-400 drop-shadow">{errors.series}</p>
					{/if}
				</div>

				<!-- Volume (Radio Buttons) -->
				<div class="space-y-4">
					<Label class="text-base font-medium text-white drop-shadow">Volume</Label>
					<div class="grid grid-cols-2 gap-4">
						{#each volumeOptions as option}
							<label class="relative">
								<input
									type="radio"
									bind:group={formData.volume_ml}
									value={option.value}
									class="peer text-primary focus-visible:ring-ring h-4 w-4 shrink-0 rounded-sm border border-gray-600 bg-transparent shadow peer-checked:border-blue-400 peer-checked:bg-blue-400 hover:border-blue-400 focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								/>
								<div
									class="metal-volume-card peer-checked:bg-blue-checked flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-gray-600 p-6 transition-all peer-checked:border-blue-400 hover:border-blue-400"
								>
									<span class="text-lg font-semibold text-white drop-shadow">{option.label}</span>
									<span class="text-sm text-gray-300 drop-shadow">{option.description}</span>
								</div>
							</label>
						{/each}
					</div>
					{#if errors.volume_ml}
						<p class="text-sm text-red-400 drop-shadow">{errors.volume_ml}</p>
					{/if}
				</div>

				<Separator class="metal-separator my-6" />

				<!-- Cost -->
				<div class="space-y-4">
					<Label for="cost" class="text-base font-medium text-white drop-shadow">Cost (₹)</Label>
					<div class="relative">
						<span class="absolute top-1/2 left-3 -translate-y-1/2 text-lg text-gray-300 drop-shadow"
							>₹</span
						>
						<Input
							id="cost"
							type="number"
							min="0"
							step="0.01"
							placeholder="2.50"
							bind:value={formData.cost}
							class="metal-input h-11 pl-10 text-lg {errors.cost
								? 'border-red-400 focus:ring-red-400'
								: 'focus:border-blue-400 focus:ring-blue-400'}"
							required
						/>
					</div>
					{#if errors.cost}
						<p class="text-sm text-red-400 drop-shadow">{errors.cost}</p>
					{/if}
				</div>

				<!-- Rating Slider -->
				<div class="space-y-4">
					<Label class="text-base font-medium text-white drop-shadow">Rating</Label>
					<div class="space-y-4">
						<div class="metal-slider-container">
							<input
								type="range"
								min="0.5"
								max="5"
								step="0.5"
								bind:value={formData.rating}
								class="metal-slider w-full"
								id="rating-slider"
							/>
						</div>
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-3">
								<div
									class="metal-rating-display rounded-lg px-4 py-2 font-semibold text-white shadow-lg"
								>
									{formData.rating}/5.0
								</div>
								<div class="text-sm text-gray-300 drop-shadow">
									{getRatingLabel(formData.rating)}
								</div>
							</div>
						</div>
					</div>
					{#if errors.rating}
						<p class="text-sm text-red-400 drop-shadow">{errors.rating}</p>
					{/if}
				</div>

				<!-- Notes -->
				<div class="space-y-4">
					<Label for="notes" class="text-base font-medium text-white drop-shadow"
						>Notes <span class="text-sm font-normal text-gray-300">(optional)</span></Label
					>
					<Textarea
						id="notes"
						placeholder="How did it taste? Any thoughts about this drink?"
						bind:value={formData.notes}
						rows={4}
						class="metal-input resize-none focus:border-blue-400 focus:ring-blue-400"
					/>
				</div>

				<Separator class="metal-separator my-6" />

				<!-- Form Actions -->
				<div class="flex flex-col space-y-3 pt-4 sm:flex-row sm:space-y-0 sm:space-x-4">
					<button
						type="submit"
						class="skeumorphic-button skeumorphic-button-primary h-12 flex-1 text-lg font-semibold"
						style="--glare-x: 50%; --glare-y: 50%;"
						on:mousemove={handleMouseMove}
						disabled={loading}
					>
						{#if loading}
							<span class="mr-2 animate-spin">⏳</span>
							Saving...
						{:else}
							Save Drink
						{/if}
					</button>
					<button
						type="button"
						class="skeumorphic-button skeumorphic-button-secondary h-12 flex-1 text-lg font-semibold"
						style="--glare-x: 50%; --glare-y: 50%;"
						on:mousemove={handleMouseMove}
						on:click={handleCancel}
						disabled={loading}
					>
						Cancel
					</button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>

<style>
	/* Metal Card */
	:global(.metal-card) {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.15);
		box-shadow:
			0 16px 64px rgba(0, 0, 0, 0.4),
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset -1px 0 0 rgba(255, 255, 255, 0.1),
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	:global(.metal-header) {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	.metal-icon {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset -1px 0 0 rgba(255, 255, 255, 0.1),
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	/* Metal Inputs */
	:global(.metal-input) {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%) !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: white !important;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	:global(.metal-input::placeholder) {
		color: rgba(255, 255, 255, 0.6) !important;
	}

	/* Ensure input text is always white and override all shadcn defaults */
	:global(.metal-input),
	:global(.metal-input:focus),
	:global(.metal-input:active),
	:global(input.metal-input),
	:global(textarea.metal-input) {
		color: white !important;
		border-color: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.metal-input:focus) {
		outline: none !important;
		border-color: #2563eb !important;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 2px rgba(37, 99, 235, 0.3) !important;
	}

	/* Override all shadcn component borders globally for this page */
	:global(.metal-input.border-input) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
	}

	:global(.metal-input:focus.border-input) {
		border: 1px solid #2563eb !important;
	}

	/* Override any remaining default borders on inputs */
	:global(input[class*='metal']) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: white !important;
	}

	:global(textarea[class*='metal']) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: white !important;
	}

	/* Override select trigger borders */
	:global([data-select-trigger].metal-input) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: white !important;
	}

	/* Remove any default shadcn borders that might appear */
	:global(.border-input) {
		border-color: rgba(255, 255, 255, 0.1) !important;
	}

	/* Fix number input specifically for cost field */
	:global(input[type='number'].metal-input) {
		color: white !important;
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
	}

	:global(input[type='number'].metal-input:focus) {
		border: 1px solid #2563eb !important;
	}

	/* Metal Volume Cards with 3D Effect */
	.metal-volume-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		transition: all 0.3s ease;
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset -1px 0 0 rgba(255, 255, 255, 0.05),
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.metal-volume-card:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.1) 100%
		);
		transform: translateY(-2px);
		border-color: rgba(49, 130, 206, 0.8) !important;
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset -1px 0 0 rgba(255, 255, 255, 0.1),
			inset 1px 0 0 rgba(0, 0, 0, 0.05),
			inset 0 -1px 0 rgba(0, 0, 0, 0.05),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Separators */
	:global(.metal-separator) {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(45, 55, 72, 0.8) 20%,
			rgba(113, 128, 150, 0.6) 50%,
			rgba(45, 55, 72, 0.8) 80%,
			transparent 100%
		);
		border: none;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Badges */
	:global(.metal-badge) {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
		color: white;
		border: 1px solid #2d3748;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Metal Buttons */
	:global(.metal-button-ghost:hover) {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #2d3748;
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Metal Slider */
	.metal-slider-container {
		padding: 20px;
		border-radius: 12px;
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.metal-slider {
		-webkit-appearance: none;
		appearance: none;
		height: 8px;
		border-radius: 4px;
		background: linear-gradient(90deg, #1a202c 0%, #2d3748 50%, #1a202c 100%);
		outline: none;
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			inset 0 1px 3px rgba(0, 0, 0, 0.5),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
		cursor: pointer;
		border: 2px solid #718096;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.8),
			inset 0 -1px 0 rgba(0, 0, 0, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		transition: all 0.2s ease;
	}

	.metal-slider::-webkit-slider-thumb:hover {
		transform: scale(1.1);
		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.9),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.metal-rating-display {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
		border: 1px solid #2d3748;
		border-top-color: #4a5568;
		border-left-color: #4a5568;
		border-right-color: #1a202c;
		border-bottom-color: #1a202c;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset -1px 0 0 rgba(255, 255, 255, 0.1),
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1);
	}

	/* Metal Dropdowns */
	.metal-dropdown-blur {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
		border: 1px solid rgba(255, 255, 255, 0.15);
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

	:global(.metal-dropdown-item) {
		border: none;
		background: transparent;
		color: white;
		transition: all 0.2s ease;
		padding-left: 1rem !important; /* Remove space for hidden indicator */
	}

	:global(.metal-dropdown-item:hover) {
		background: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.metal-dropdown-item[data-highlighted]) {
		background: rgba(255, 255, 255, 0.1) !important;
	}

	:global(.metal-dropdown-item[data-state='checked']) {
		background: rgba(255, 255, 255, 0.2) !important;
		font-weight: 500;
	}

	/* Hide select item indicators (checkmarks) */
	.metal-dropdown-item :global(.absolute.left-2) {
		display: none !important;
	}

	.metal-dropdown-item :global(span:first-child) {
		display: none !important;
	}

	/* Ensure number input placeholder is white */
	:global(.metal-input[type='number']::placeholder) {
		color: rgba(255, 255, 255, 0.6) !important;
	}

	/* Enhanced Skeumorphic Buttons with Dynamic Glare */
	.skeumorphic-button {
		position: relative;
		border: none;
		border-radius: 12px;
		padding: 12px 24px;
		font-weight: 600;
		letter-spacing: 0.5px;
		transition: all 0.3s ease;
		cursor: pointer;
		overflow: hidden;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 8px 16px rgba(0, 0, 0, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.skeumorphic-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: 12px 12px 0 0;
		pointer-events: none;
	}

	.skeumorphic-button::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle 100px at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.4) 0%,
			rgba(255, 255, 255, 0.2) 20%,
			transparent 70%
		);
		border-radius: 12px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.skeumorphic-button:hover::after {
		opacity: 1;
	}

	.skeumorphic-button-primary {
		background: linear-gradient(135deg, #16a34a 0%, #15803d 30%, #14532d 70%, #15803d 100%);
		color: white;
		border: 1px solid #14532d;
		box-shadow:
			0 8px 16px rgba(21, 128, 61, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	.skeumorphic-button-primary:hover {
		background: linear-gradient(135deg, #15803d 0%, #14532d 30%, #0f172a 70%, #14532d 100%);
		transform: translateY(-2px);
		box-shadow:
			0 12px 24px rgba(21, 128, 61, 0.5),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.skeumorphic-button-primary:active {
		transform: translateY(0);
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.skeumorphic-button-secondary {
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 8px 16px rgba(51, 65, 85, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.skeumorphic-button-secondary:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-2px);
		box-shadow:
			0 12px 24px rgba(51, 65, 85, 0.5),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.4);
	}

	.skeumorphic-button-secondary:active {
		transform: translateY(0);
		box-shadow:
			0 4px 8px rgba(51, 65, 85, 0.4),
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.4);
	}

	.skeumorphic-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none !important;
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.1),
			0 1px 2px rgba(0, 0, 0, 0.05),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.skeumorphic-button:disabled::after {
		display: none;
	}

	/* Skeumorphic Back Button */
	.skeumorphic-back-button {
		position: relative;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 16px;
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: white;
		cursor: pointer;
		overflow: hidden;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow:
			0 8px 16px rgba(0, 0, 0, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.skeumorphic-back-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: 16px 16px 0 0;
		pointer-events: none;
	}

	.skeumorphic-back-button::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle 40px at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.5) 0%,
			rgba(255, 255, 255, 0.3) 20%,
			transparent 70%
		);
		border-radius: 16px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.skeumorphic-back-button:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-2px);
		box-shadow:
			0 12px 24px rgba(0, 0, 0, 0.4),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.skeumorphic-back-button:hover::after {
		opacity: 1;
	}

	.skeumorphic-back-button:active {
		transform: translateY(0);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.4);
	}

	.back-arrow {
		font-size: 24px;
		font-weight: bold;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
		position: relative;
		z-index: 1;
	}

	/* Additional comprehensive overrides to eliminate all black borders */
	:global(.metal-input[data-select-trigger]) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
		color: white !important;
	}

	/* Override Card component borders */
	:global(.metal-card.bg-card) {
		border: 1px solid rgba(255, 255, 255, 0.15) !important;
	}

	/* Override any remaining shadcn borders */
	:global(.border) {
		border-color: rgba(255, 255, 255, 0.1) !important;
	}

	/* Override separator borders */
	:global(.metal-separator.border-border) {
		border-color: transparent !important;
	}

	/* Ensure all buttons on this page have proper styling */
	:global(button.border-input) {
		border: 1px solid rgba(255, 255, 255, 0.1) !important;
	}

	/* Override any default text colors that might be black */
	:global(.text-foreground) {
		color: white !important;
	}

	/* Final catch-all for any remaining black borders */
	:global(*[class*='border']:not(.metal-separator)) {
		border-color: rgba(255, 255, 255, 0.1) !important;
	}

	/* Ensure all form elements have white text */
	:global(input, textarea, select) {
		color: white !important;
	}

	/* Blue checked background for peer-checked states */
	:global(.peer:checked ~ .bg-blue-checked) {
		background: linear-gradient(
			135deg,
			rgba(59, 130, 246, 0.2),
			rgba(59, 130, 246, 0.1)
		) !important;
	}
</style>
