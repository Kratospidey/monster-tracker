<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { arc, pie as d3Pie } from 'd3-shape';
	import { scaleOrdinal } from 'd3-scale';
	import { LayerChartService, type LayerChartData } from '../../../services/layerchart.service';
	import type { CanLibraryItem } from '../../../services/library.service'; // For input prop type

	export let canLibraryItems: CanLibraryItem[] = [];
	export let title: string = 'Can Distribution by Type';

	let chartData: LayerChartData;
	let pieData: any[] = [];
	let hoveredSlice: any = null;
	let chartContainer: HTMLDivElement;
	let tooltip: { x: number; y: number; visible: boolean; data: any; position: 'top' | 'bottom' } = {
		x: 0,
		y: 0,
		visible: false,
		data: null,
		position: 'top'
	};

	// Color scheme for pie slices - can be expanded or made dynamic
	const seriesColors: Record<string, string> = {
		Normal: '#22c55e', // Green
		Ultra: '#3b82f6', // Blue
		Juice: '#f97316', // Orange
		Reserve: '#8b5cf6', // Purple
		Special: '#ef4444', // Red
		Default: '#64748b' // Slate for others
	};

	function getSeriesColor(series: string): string {
		return seriesColors[series] || seriesColors.Default;
	}

	const colorScale = scaleOrdinal<string, string>()
		.domain(Object.keys(seriesColors))
		.range(Object.values(seriesColors));

	$: {
		chartData = LayerChartService.getCanDistributionData(canLibraryItems);
		const pieGenerator = d3Pie<any>()
			.value((d) => d.value)
			.sort(null); // Use pre-sorted data
		pieData = pieGenerator(chartData.data);
	}

	const arcGenerator = arc<any>()
		.innerRadius(80) // Makes it a donut chart
		.outerRadius(150)
		.cornerRadius(5);

	const arcGeneratorHover = arc<any>().innerRadius(75).outerRadius(155).cornerRadius(5);

	function handleMouseMove(event: MouseEvent, d: any) {
		if (!chartContainer) return;
		hoveredSlice = d;
		const rect = chartContainer.getBoundingClientRect();

		// Calculate position relative to the chart container for consistent tooltip placement
		const svgElement = chartContainer.querySelector('svg');
		if (!svgElement) return;
		const svgRect = svgElement.getBoundingClientRect();

		const centroid = arcGenerator.centroid(d);
		// Position tooltip near the centroid of the slice, relative to the SVG container
		const tooltipX = centroid[0] + svgRect.width / 2;
		const tooltipY = centroid[1] + svgRect.height / 2;

		const shouldShowAbove = tooltipY < svgRect.height / 2;

		tooltip = {
			x: tooltipX,
			y: tooltipY,
			visible: true,
			data: d.data, // d.data contains the original data object
			position: shouldShowAbove ? 'bottom' : 'top' // Adjust based on slice position
		};
	}

	function handleMouseLeave() {
		hoveredSlice = null;
		tooltip.visible = false;
	}

	function getPercentage(value: number, total: number): string {
		if (total === 0) return '0%';
		return ((value / total) * 100).toFixed(1) + '%';
	}

	$: totalCans = canLibraryItems.reduce((sum, item) => sum + item.count, 0);
</script>

<div class="skeumorphic-chart-container" bind:this={chartContainer}>
	<h3 class="skeumorphic-chart-title">{title}</h3>

	<div class="chart-wrapper donut-chart-wrapper" style="height: 380px;">
		{#if pieData.length > 0}
			<svg viewBox="-180 -180 360 360" class="chart-svg" preserveAspectRatio="xMidYMid meet">
				<defs>
					{#each pieData as slice, i}
						{@const sliceColor = getSeriesColor(slice.data.series)}
						<linearGradient id={`sliceGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:{sliceColor};stop-opacity:1" />
							<stop offset="100%" style="stop-color:{sliceColor};stop-opacity:0.7" />
						</linearGradient>
					{/each}
					<filter id="donutSliceShadow">
						<feDropShadow dx="0" dy="3" stdDeviation="5" flood-opacity="0.3" />
					</filter>
					<linearGradient id="donutCenterBg" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" style="stop-color:rgba(50,50,50,0.8);stop-opacity:1" />
						<stop offset="100%" style="stop-color:rgba(30,30,30,0.9);stop-opacity:1" />
					</linearGradient>
				</defs>

				<g class="slices-group">
					{#each pieData as slice, i}
						{@const isHovered = hoveredSlice === slice}
						<path
							d={isHovered ? arcGeneratorHover(slice) : arcGenerator(slice)}
							fill={`url(#sliceGradient${i})`}
							stroke="rgba(255,255,255,0.2)"
							stroke-width="1.5"
							filter="url(#donutSliceShadow)"
							class="donut-slice"
							class:hovered={isHovered}
							on:mouseenter={(e) => handleMouseMove(e, slice)}
							on:mouseleave={handleMouseLeave}
							role="button"
							tabindex="0"
						/>
					{/each}
				</g>

				<circle
					cx="0"
					cy="0"
					r="70"
					fill="url(#donutCenterBg)"
					stroke="rgba(255,255,255,0.1)"
					stroke-width="1"
				/>
				<text x="0" y="-5" text-anchor="middle" class="center-text-total">{totalCans}</text>
				<text x="0" y="15" text-anchor="middle" class="center-text-label">Total Cans</text>
			</svg>

			<!-- Legend -->
			<div class="donut-legend scrollable-legend">
				{#each pieData as slice}
					{@const sliceColor = getSeriesColor(slice.data.series)}
					<div
						class="legend-item"
						title="{slice.data.name}: {slice.data.value} cans ({getPercentage(
							slice.data.value,
							totalCans
						)})"
					>
						<div class="legend-color" style="background-color:{sliceColor};"></div>
						<span class="legend-name truncate">{slice.data.name}</span>
						<span class="legend-value"
							>({slice.data.value} | {getPercentage(slice.data.value, totalCans)})</span
						>
					</div>
				{/each}
			</div>
		{:else}
			<div class="empty-chart">
				<p>No can distribution data available. Add some cans to your library!</p>
			</div>
		{/if}
	</div>

	<!-- Tooltip (Chart-Relative) -->
	{#if tooltip.visible && tooltip.data}
		<div
			class="chart-tooltip"
			class:tooltip-top={tooltip.position === 'top'}
			class:tooltip-bottom={tooltip.position === 'bottom'}
			style="left: {tooltip.x}px; top: {tooltip.y}px;"
		>
			<div class="tooltip-header" style="color: {getSeriesColor(tooltip.data.series)};">
				<strong>{tooltip.data.name}</strong>
			</div>
			<div class="tooltip-content">
				<div class="tooltip-stat">Count: {tooltip.data.value}</div>
				<div class="tooltip-stat">Percentage: {getPercentage(tooltip.data.value, totalCans)}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.skeumorphic-chart-container {
		position: relative;
		background: linear-gradient(145deg, rgba(40, 40, 40, 0.8), rgba(20, 20, 20, 0.9));
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 20px;
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.5),
			inset 0 1px 1px rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
	}

	.skeumorphic-chart-title {
		color: rgba(255, 255, 255, 0.9);
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 15px;
		text-align: center;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
	}

	.donut-chart-wrapper {
		display: flex;
		flex-direction: column; /* Changed from row to column for legend below */
		align-items: center;
		gap: 15px; /* Gap between chart and legend */
	}

	.chart-svg {
		max-width: 100%;
		max-height: 250px; /* Max height for the SVG */
		overflow: visible;
	}

	.donut-slice {
		cursor: pointer;
		transition:
			transform 0.2s ease-out,
			filter 0.2s ease-out;
	}

	.donut-slice.hovered {
		transform: scale(1.05);
		filter: brightness(1.2) drop-shadow(0 0 10px rgba(200, 200, 255, 0.5));
	}

	.center-text-total {
		fill: #fff;
		font-size: 2.5em;
		font-weight: bold;
		dominant-baseline: middle;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.center-text-label {
		fill: rgba(200, 200, 200, 0.8);
		font-size: 0.8em;
		dominant-baseline: middle;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.donut-legend {
		width: 100%;
		max-height: 100px; /* Max height for legend, enables scrolling */
		overflow-y: auto;
		padding-right: 10px; /* For scrollbar */
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.scrollable-legend::-webkit-scrollbar {
		width: 5px;
	}
	.scrollable-legend::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 10px;
	}
	.scrollable-legend::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 10px;
	}
	.scrollable-legend::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.3);
	}

	.legend-item {
		display: flex;
		align-items: center;
		font-size: 0.75rem;
		color: rgba(220, 220, 220, 0.9);
		cursor: default;
	}

	.legend-color {
		width: 12px;
		height: 12px;
		border-radius: 3px;
		margin-right: 8px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.legend-name {
		flex-grow: 1;
		margin-right: 5px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.legend-value {
		font-weight: 500;
		color: rgba(255, 255, 255, 0.7);
	}

	.empty-chart {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 150px;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
		text-align: center;
		padding: 20px;
	}

	.chart-tooltip {
		position: absolute;
		z-index: 1000;
		background: linear-gradient(145deg, rgba(45, 45, 45, 0.95), rgba(25, 25, 25, 0.98));
		border: 1px solid rgba(255, 255, 255, 0.25);
		border-radius: 8px;
		padding: 10px 12px;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(12px);
		min-width: 160px;
		pointer-events: none;
		font-size: 0.8rem;
	}

	.tooltip-top {
		transform: translateX(-50%) translateY(-100%) translateY(-12px);
	}

	.tooltip-bottom {
		transform: translateX(-50%) translateY(12px);
	}

	.tooltip-header {
		font-weight: 700;
		margin-bottom: 6px;
		font-size: 0.85rem;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 4px;
	}

	.tooltip-content {
		padding-top: 4px;
	}

	.tooltip-stat {
		color: rgba(230, 230, 230, 0.9);
		margin-bottom: 3px;
	}
	.truncate {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 150px; /* Adjust as needed for your layout */
	}
</style>
