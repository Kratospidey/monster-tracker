<script lang="ts">
	import { getContext } from 'svelte';

	const { xScale, data, height } = getContext('LayerCake') as any;

	$: xIndices =
		$data && $data.length > 0
			? $data.length > 2
				? [0, Math.floor($data.length / 2), $data.length - 1]
				: $data.length > 1
					? [0, $data.length - 1]
					: [0]
			: [];
</script>

{#if $data && xIndices.length > 0}
	{#each xIndices as i}
		{@const d = $data[i]}
		{@const x = $xScale(d.date)}
		<text
			{x}
			y={$height + 20}
			text-anchor="middle"
			fill="rgba(255,255,255,0.7)"
			font-size="11"
			font-weight="500"
			class="x-axis-label"
		>
			{d.dateString}
		</text>
	{/each}
{/if}

<style>
	.x-axis-label {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
	}
</style>
