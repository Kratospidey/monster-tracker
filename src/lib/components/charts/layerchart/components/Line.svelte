<script lang="ts">
	import { getContext } from 'svelte';

	export let color: string = '#10b981';
	export let strokeWidth: number = 3;

	const { data, xGet, yGet } = getContext('LayerCake') as any;

	let path = '';
	$: if ($data && $data.length > 0) {
		path = 'M' + $data.map((d: any) => `${$xGet(d)},${$yGet(d)}`).join('L');
	}
</script>

<defs>
	<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
		<stop offset="0%" style="stop-color:#34d399;stop-opacity:1" />
		<stop offset="50%" style="stop-color:#10b981;stop-opacity:1" />
		<stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
	</linearGradient>

	<filter id="lineGlow">
		<feGaussianBlur stdDeviation="3" result="coloredBlur" />
		<feMerge>
			<feMergeNode in="coloredBlur" />
			<feMergeNode in="SourceGraphic" />
		</feMerge>
	</filter>
</defs>

{#if path}
	<path
		d={path}
		fill="none"
		stroke={color}
		stroke-width={strokeWidth}
		stroke-linejoin="round"
		stroke-linecap="round"
		filter="url(#glowEffect)"
	/>
{/if}

<style>
	/* No unused CSS selectors */
</style>
