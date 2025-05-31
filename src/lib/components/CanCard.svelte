<script lang="ts">
	import type { CanLibraryItem } from '$lib/services/library.service';
	import { LibraryService } from '$lib/services/library.service';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { createEventDispatcher } from 'svelte';

	export let can: CanLibraryItem;

	const dispatch = createEventDispatcher();

	let fileInput: HTMLInputElement;
	let uploading = false;
	let imageLoadError = false;

	function handleImageClick() {
		fileInput?.click();
	}

	function handleImageLoadError() {
		console.log('❌ Image load error for:', can.name, can.series, can.imageUrl);
		imageLoadError = true;
		// Optionally remove the broken image URL
		can.imageUrl = undefined;
		dispatch('imageUpdated');
	}

	function handleImageLoad() {
		console.log('✅ Image loaded successfully for:', can.name, can.series);
		imageLoadError = false;
	}

	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		if (!file.type.startsWith('image/')) {
			toast.error('Please select an image file');
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast.error('Image must be smaller than 5MB');
			return;
		}

		uploading = true;

		try {
			const imageUrl = await LibraryService.addCanImage(can.name, can.series, file);
			can.imageUrl = imageUrl;
			toast.success('Image uploaded successfully!');
			dispatch('imageUpdated');
		} catch (error) {
			toast.error('Failed to upload image: ' + error);
		} finally {
			uploading = false;
		}
	}

	async function handleRemoveImage() {
		try {
			await LibraryService.removeCanImage(can.name, can.series);
			can.imageUrl = undefined;
			toast.success('Image removed');
			dispatch('imageUpdated');
		} catch (error) {
			toast.error('Failed to remove image: ' + error);
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function getSeriesGradient(series: string): string {
		const gradients: Record<string, string> = {
			Normal: 'from-green-500 via-green-600 to-green-700',
			Ultra: 'from-blue-500 via-blue-600 to-blue-700',
			Juice: 'from-orange-500 via-orange-600 to-orange-700',
			Reserve: 'from-purple-500 via-purple-600 to-purple-700',
			Special: 'from-red-500 via-red-600 to-red-700'
		};
		return gradients[series] || 'from-gray-500 via-gray-600 to-gray-700';
	}

	function getSeriesGlow(series: string): string {
		const glows: Record<string, string> = {
			Normal: 'shadow-green-500',
			Ultra: 'shadow-blue-500',
			Juice: 'shadow-orange-500',
			Reserve: 'shadow-purple-500',
			Special: 'shadow-red-500'
		};
		return glows[series] || 'shadow-gray-500';
	}

	function getRatingStars(rating: number): string {
		const fullStars = Math.floor(rating);
		const hasHalfStar = rating % 1 >= 0.5;
		return (
			'★'.repeat(fullStars) +
			(hasHalfStar ? '☆' : '') +
			'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
		);
	}
</script>

<!-- Glass-morphic Card with Skeumorphic Design -->
<div class="can-card-container group">
	<div class="can-card">
		<!-- Glossy Top Reflection -->
		<div class="glossy-reflection"></div>

		<!-- Image Section with Depth -->
		<div class="image-section">
			{#if can.imageUrl}
				<div class="image-frame">
					<img
						src={can.imageUrl}
						alt={can.name}
						class="can-image"
						on:click={handleImageClick}
						on:error={handleImageLoadError}
						on:load={handleImageLoad}
					/>
					<!-- Remove button with glass effect -->
					<button class="remove-btn" on:click={handleRemoveImage} title="Remove image">
						<span class="remove-icon">✕</span>
					</button>
				</div>
			{:else}
				<div
					class="upload-area"
					on:click={handleImageClick}
					role="button"
					tabindex="0"
					on:keydown={(e) => e.key === 'Enter' && handleImageClick()}
				>
					{#if uploading}
						<div class="upload-icon pulse">⏳</div>
						<p class="upload-text">Uploading...</p>
					{:else}
						<div class="upload-icon">📷</div>
						<p class="upload-text">Add Image</p>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Content Section with Glass Effect -->
		<div class="content-section">
			<!-- Title with Glow -->
			<h3 class="can-title">{can.name}</h3>

			<!-- Series Badge with 3D Effect -->
			<div
				class="series-badge bg-gradient-to-r {getSeriesGradient(
					can.series
				)} shadow-lg {getSeriesGlow(can.series)}"
			>
				<span class="series-text">{can.series}</span>
			</div>

			<!-- Stats Grid with Glass Cards -->
			<div class="stats-grid">
				<div class="stat-card">
					<div class="stat-value">{can.count}</div>
					<div class="stat-label">Cans</div>
				</div>

				<div class="stat-card">
					<div class="stat-value">{formatCurrency(can.totalSpent)}</div>
					<div class="stat-label">Total</div>
				</div>

				<div class="stat-card">
					<div class="stat-value">{can.volume_ml}ml</div>
					<div class="stat-label">Volume</div>
				</div>

				<div class="stat-card">
					<div class="stat-value rating-stars" title="{can.averageRating.toFixed(2)} stars">
						{getRatingStars(can.averageRating)}
					</div>
					<div class="stat-label">Rating</div>
				</div>
			</div>

			<!-- Date Information with Separator -->
			<div class="date-section">
				<div class="date-separator"></div>
				<div class="date-info">
					<div class="date-item">
						<span class="date-label">First:</span>
						<span class="date-value">{formatDate(can.firstPurchased)}</span>
					</div>
					<div class="date-item">
						<span class="date-label">Last:</span>
						<span class="date-value">{formatDate(can.lastPurchased)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		on:change={handleImageUpload}
	/>
</div>

<style>
	@reference "tailwindcss";

	.can-card-container {
		perspective: 1000px;
		@apply h-full;
	}

	.can-card {
		@apply relative h-full overflow-hidden;
		@apply border;
		@apply rounded-2xl;
		@apply transition-all duration-500 ease-out;
		@apply shadow-2xl;
		background: linear-gradient(
			135deg,
			rgba(30, 41, 59, 0.9),
			rgba(15, 23, 42, 0.9),
			rgba(2, 6, 23, 0.9)
		);
		border-color: rgba(71, 85, 105, 0.3);
		transform-style: preserve-3d;
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
	}

	.can-card:hover {
		border-color: rgba(100, 116, 139, 0.5);
		transform: rotateY(2deg) rotateX(2deg) translateY(-8px);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.8),
			0 0 0 1px rgba(255, 255, 255, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.glossy-reflection {
		@apply absolute inset-0 rounded-2xl;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.1) 25%,
			transparent 50%
		);
		pointer-events: none;
		z-index: 10;
	}

	.image-section {
		@apply relative aspect-square p-3;
		background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
	}

	.image-frame {
		@apply relative h-full w-full overflow-hidden rounded-xl;
		@apply shadow-inner;
		background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
		border: 2px solid rgba(255, 255, 255, 0.1);
	}

	.can-image {
		@apply h-full w-full cursor-pointer object-cover;
		@apply transition-all duration-300;
		filter: brightness(1.1) contrast(1.05) saturate(1.1);
	}

	.can-image:hover {
		@apply scale-105;
		filter: brightness(1.2) contrast(1.1) saturate(1.2);
	}

	.remove-btn {
		@apply absolute top-2 right-2;
		@apply h-8 w-8 rounded-full;
		@apply border;
		@apply flex items-center justify-center;
		@apply transition-all duration-200;
		@apply shadow-lg;
		background: rgba(239, 68, 68, 0.8);
		backdrop-filter: blur(4px);
		border-color: rgba(248, 113, 113, 0.5);
	}

	.remove-btn:hover {
		@apply scale-110;
		background: rgba(220, 38, 38, 0.9);
		box-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
	}

	.remove-icon {
		@apply text-sm font-bold text-white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.upload-area {
		@apply h-full w-full rounded-xl;
		@apply flex flex-col items-center justify-center;
		@apply cursor-pointer transition-all duration-300;
		@apply border-2 border-dashed;
		background: linear-gradient(135deg, rgba(51, 65, 85, 0.5), rgba(30, 41, 59, 0.5));
		border-color: rgba(100, 116, 139, 0.3);
		color: rgb(203, 213, 225);
	}

	.upload-area:hover {
		@apply shadow-lg;
		background: linear-gradient(135deg, rgba(71, 85, 105, 0.5), rgba(51, 65, 85, 0.5));
		border-color: rgba(148, 163, 184, 0.5);
		color: rgb(226, 232, 240);
	}

	.upload-icon {
		@apply mb-2 text-4xl;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.pulse {
		animation: pulse 1.5s infinite;
	}

	.upload-text {
		@apply text-sm font-medium;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.content-section {
		@apply flex flex-1 flex-col p-4;
	}

	.can-title {
		@apply mb-3 text-lg font-bold text-white;
		@apply line-clamp-2;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
		background: linear-gradient(135deg, #ffffff, #e2e8f0);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.series-badge {
		@apply mb-4 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white;
		@apply border;
		border-color: rgba(255, 255, 255, 0.2);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.series-text {
		@apply relative;
	}

	.stats-grid {
		@apply mb-4 grid grid-cols-2 gap-3;
	}

	.stat-card {
		@apply rounded-lg p-3;
		@apply border;
		@apply text-center;
		@apply transition-all duration-200;
		background: linear-gradient(135deg, rgba(51, 65, 85, 0.3), rgba(30, 41, 59, 0.3));
		border-color: rgba(71, 85, 105, 0.3);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.stat-card:hover {
		@apply scale-105;
		background: linear-gradient(135deg, rgba(71, 85, 105, 0.4), rgba(51, 65, 85, 0.4));
		border-color: rgba(100, 116, 139, 0.4);
	}

	.stat-value {
		@apply text-sm font-bold text-white;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.rating-stars {
		@apply text-yellow-400;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
	}

	.stat-label {
		@apply mt-1 text-xs;
		color: rgb(203, 213, 225);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.date-section {
		@apply mt-auto;
	}

	.date-separator {
		@apply mb-3 h-px;
		background: linear-gradient(to right, transparent, rgba(100, 116, 139, 0.3), transparent);
	}

	.date-info {
		@apply space-y-1;
	}

	.date-item {
		@apply flex justify-between text-xs;
	}

	.date-label {
		color: rgb(148, 163, 184);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.date-value {
		@apply font-medium;
		color: rgb(226, 232, 240);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
