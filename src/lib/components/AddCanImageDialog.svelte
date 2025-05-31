<script lang="ts">
	import { LibraryService } from '$lib/services/library.service';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Card } from '$lib/components/ui/card';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';
	import { DRINK_SERIES } from '$lib/types/drink';

	export let open = false;
	export let existingCans: Array<{ name: string; series: string }> = [];

	const dispatch = createEventDispatcher();

	let imageFile: File | null = null;
	let previewUrl = '';
	let selectedCanName = { value: '', label: 'Select can name...' };
	let selectedSeries = { value: '', label: 'Select series...' };
	let customCanName = '';
	let uploading = false;

	$: uniqueCanNames = [...new Set(existingCans.map((can) => can.name))].sort();
	$: canUpload =
		imageFile &&
		((selectedCanName.value && selectedSeries.value) || (customCanName && selectedSeries.value));

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				toast.error('File size must be less than 5MB');
				return;
			}

			if (!file.type.startsWith('image/')) {
				toast.error('Please select an image file');
				return;
			}

			imageFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				previewUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	async function handleUpload() {
		if (!imageFile) {
			toast.error('Please select an image');
			return;
		}

		// More robust value extraction for Select components
		let canName = customCanName;
		if (!canName && selectedCanName) {
			canName =
				typeof selectedCanName === 'string'
					? selectedCanName
					: typeof selectedCanName === 'object' && selectedCanName?.value
						? selectedCanName.value
						: '';
		}

		let series = '';
		if (selectedSeries) {
			series =
				typeof selectedSeries === 'string'
					? selectedSeries
					: typeof selectedSeries === 'object' && selectedSeries?.value
						? selectedSeries.value
						: '';
		}

		console.log('🔍 Upload Debug:', {
			customCanName,
			selectedCanName,
			selectedSeries,
			extractedCanName: canName,
			extractedSeries: series,
			canNameType: typeof selectedCanName,
			seriesType: typeof selectedSeries
		});

		if (!canName || !series) {
			toast.error('Please fill in all fields');
			console.error('Missing required fields:', { canName, series });
			return;
		}

		try {
			uploading = true;
			await LibraryService.addCanImage(canName, series, imageFile);
			toast.success('Image uploaded successfully!');

			// Reset form
			imageFile = null;
			previewUrl = '';
			selectedCanName = { value: '', label: 'Select can name...' };
			selectedSeries = { value: '', label: 'Select series...' };
			customCanName = '';
			open = false;

			dispatch('imageAdded');
		} catch (error) {
			console.error('Upload error:', error);
			toast.error('Failed to upload image: ' + error);
		} finally {
			uploading = false;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50"
		style="background: rgba(0, 0, 0, 0.5);"
		on:click={() => (open = false)}
		on:keydown={(e) => e.key === 'Escape' && (open = false)}
		role="dialog"
		tabindex="0"
	>
		<div
			class="fixed z-50 w-full max-w-lg"
			style="top: 50%; left: 50%; transform: translate(-50%, -50%);"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<Card class="bg-white p-6 shadow-lg">
				<div class="mb-4">
					<h2 class="text-xl font-semibold">Add Can Image</h2>
					<p class="text-sm text-gray-600">Upload an image for a Monster Energy can</p>
				</div>

				<div class="space-y-4">
					<!-- File Input -->
					<div>
						<Label for="image">Can Image</Label>
						<Input
							id="image"
							type="file"
							accept="image/*"
							on:change={handleFileSelect}
							class="mt-1"
						/>
						{#if previewUrl}
							<div class="mt-2">
								<img src={previewUrl} alt="Preview" class="h-32 w-32 rounded object-cover" />
							</div>
						{/if}
					</div>

					<!-- Can Name -->
					<div>
						<Label for="can-name">Can Name</Label>
						<Select.Root bind:selected={selectedCanName}>
							<Select.Trigger id="can-name" class="mt-1">
								<Select.Value placeholder="Select or add new..." />
							</Select.Trigger>
							<Select.Content>
								{#each uniqueCanNames as canName}
									<Select.Item value={{ value: canName, label: canName }}>{canName}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<Input placeholder="Or enter new can name" bind:value={customCanName} class="mt-2" />
					</div>

					<!-- Series -->
					<div>
						<Label for="series">Series</Label>
						<Select.Root bind:selected={selectedSeries}>
							<Select.Trigger id="series" class="mt-1">
								<Select.Value placeholder="Select series" />
							</Select.Trigger>
							<Select.Content>
								{#each DRINK_SERIES as series}
									<Select.Item value={{ value: series, label: series }}>{series}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<!-- Actions -->
				<div class="mt-6 flex justify-end gap-2">
					<Button variant="outline" on:click={() => (open = false)}>Cancel</Button>
					<Button on:click={handleUpload} disabled={uploading || !canUpload}>
						{uploading ? 'Uploading...' : 'Upload'}
					</Button>
				</div>
			</Card>
		</div>
	</div>
{/if}
