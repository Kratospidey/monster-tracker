<script lang="ts">
	import { getContext } from 'svelte';

	const { yScale, width } = getContext('LayerCake') as any;

	$: yTicks = $yScale ? $yScale.ticks(4) : [];
</script>

{#each yTicks as tick}
	{@const y = $yScale(tick)}
	<g class="y-tick">
		<!-- Grid line -->
		<line x1="0" x2={$width} y1={y} y2={y} stroke="rgba(255,255,255,0.1)" stroke-width="1" />
		<!-- Y-axis label -->
		<text
			x="-10"
			{y}
			dy="0.32em"
			text-anchor="end"
			fill="rgba(255,255,255,0.7)"
			font-size="12"
			font-weight="500"
			class="y-axis-label"
		>
			${tick.toFixed(0)}
		</text>
	</g>
{/each}

<style>
	.y-axis-label {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
	}
</style>
