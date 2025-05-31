<script lang="ts">
	import { getContext } from 'svelte';

	export let handleMouseMove: (event: MouseEvent, d: any) => void;
	export let handleMouseLeave: () => void;
	export let fill: string = '#10b981';
	export let stroke: string = 'rgba(255,255,255,0.8)';
	export let strokeWidth: number = 2;
	export let radius: number = 6;

	const { data, xGet, yGet } = getContext('LayerCake') as any;
</script>

<defs>
	<filter id="pointShadow">
		<feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" />
	</filter>

	<filter id="pointGlow">
		<feGaussianBlur stdDeviation="2" result="coloredBlur" />
		<feMerge>
			<feMergeNode in="coloredBlur" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
</defs>

{#if $data}
	{#each $data as d, i}
		<circle
			cx={$xGet(d)}
			cy={$yGet(d)}
			r={radius}
			{fill}
			{stroke}
			stroke-width={strokeWidth}
			filter="url(#dropShadow)"
			class="data-point"
			style="cursor: pointer;"
			on:mouseenter={(e) => handleMouseMove(e, d)}
			on:mouseleave={handleMouseLeave}
		/>
	{/each}
{/if}

<style>
	.data-point {
		transition: all 0.2s ease;
	}

	.data-point:hover {
		r: 8;
		filter: url(#glowEffect);
	}
</style>
