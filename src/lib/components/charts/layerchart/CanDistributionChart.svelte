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
		.innerRadius(65) // Makes it a donut chart
		.outerRadius(120)
		.cornerRadius(5);

	const arcGeneratorHover = arc<any>().innerRadius(65).outerRadius(130).cornerRadius(5);

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

	<div class="chart-wrapper" style="height: 340px;">
		{#if pieData.length > 0}
			<div class="donut-chart">
				<svg viewBox="0 0 360 340" class="chart-svg">
					<defs>
						{#each pieData as slice, i}
							{@const sliceColor = getSeriesColor(slice.data.series)}
							<linearGradient id={`sliceGradient${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:{sliceColor};stop-opacity:1" />
								<stop offset="50%" style="stop-color:{sliceColor};stop-opacity:0.8" />
								<stop offset="100%" style="stop-color:{sliceColor};stop-opacity:0.6" />
							</linearGradient>
						{/each}

						<filter id="sliceShadow">
							<feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.4" />
						</filter>

						<filter id="sliceGlow">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						<linearGradient id="centerBg" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
							<stop offset="100%" style="stop-color:rgba(0,0,0,0.2);stop-opacity:1" />
						</linearGradient>
					</defs>

					<!-- Chart background circle -->
					<circle
						cx="180"
						cy="170"
						r="155"
						fill="none"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="2"
					/>

					<!-- Donut slices -->
					<g transform="translate(180, 170)">
						{#each pieData as slice, i}
							{@const isHovered = hoveredSlice === slice}
							<path
								d={isHovered ? arcGeneratorHover(slice) : arcGenerator(slice)}
								fill="url(#sliceGradient{i})"
								stroke="rgba(255,255,255,0.3)"
								stroke-width="2"
								filter="url(#sliceShadow)"
								class="donut-slice"
								class:hovered={isHovered}
								on:mouseenter={(e) => handleMouseMove(e, slice)}
								on:mouseleave={handleMouseLeave}
								role="button"
								tabindex="0"
							/>
						{/each}
					</g>

					<!-- Center circle with summary -->
					<circle
						cx="180"
						cy="170"
						r="75"
						fill="url(#centerBg)"
						stroke="rgba(255,255,255,0.2)"
						stroke-width="2"
						filter="url(#sliceShadow)"
					/>

					<!-- Center text -->
					<text
						x="180"
						y="155"
						text-anchor="middle"
						fill="rgba(255,255,255,0.9)"
						font-size="14"
						font-weight="600"
						class="center-text"
					>
						Total Cans
					</text>
					<text
						x="180"
						y="175"
						text-anchor="middle"
						fill="#10b981"
						font-size="26"
						font-weight="700"
						class="center-number"
					>
						{totalCans}
					</text>
				</svg>

				<!-- Legend -->
				<div class="legend">
					{#each pieData as slice, i}
						{@const sliceColor = getSeriesColor(slice.data.series)}
						<div class="legend-item">
							<div
								class="legend-color"
								style="background: linear-gradient(135deg, {sliceColor}, {sliceColor}88);"
							></div>
							<span class="legend-text">{slice.data.name} ({slice.data.value})</span>
							<span class="legend-percentage">{getPercentage(slice.data.value, totalCans)}</span>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-chart">
				<p>No can distribution data available. Add some cans to your library!</p>
			</div>
		{/if}
	</div>

	<!-- Custom tooltip -->
	{#if tooltip.visible && tooltip.data}
		<div class="skeumorphic-tooltip" style="left: {tooltip.x + 10}px; top: {tooltip.y - 10}px;">
			<div class="tooltip-header">
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
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		padding: 20px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.skeumorphic-chart-title {
		color: rgba(255, 255, 255, 0.9);
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 16px;
		text-align: center;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.chart-wrapper {
		position: relative;
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.2) 0%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(0, 0, 0, 0.2) 100%
		);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 8px;
		box-shadow:
			inset 0 1px 3px rgba(0, 0, 0, 0.4),
			inset 0 -1px 0 rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.donut-chart {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		padding: 20px;
	}

	.chart-svg {
		width: 360px;
		height: 340px;
		flex-shrink: 0;
	}

	.donut-slice {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.donut-slice:hover,
	.donut-slice.hovered {
		filter: url(#sliceGlow);
		stroke-width: 3;
	}

	.center-text {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
	}

	.center-number {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-left: 24px;
		min-width: 140px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.03) 100%
		);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.legend-color {
		width: 18px;
		height: 18px;
		border-radius: 6px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
		flex-shrink: 0;
	}

	.legend-text {
		color: rgba(255, 255, 255, 0.8);
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		flex: 1;
	}

	.legend-percentage {
		color: rgba(255, 255, 255, 0.6);
		font-size: 12px;
		font-weight: 400;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		flex-shrink: 0;
	}

	.empty-chart {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
	}

	.skeumorphic-tooltip {
		position: fixed;
		z-index: 1000;
		background: linear-gradient(145deg, rgba(30, 30, 30, 0.95) 0%, rgba(0, 0, 0, 0.9) 100%);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		padding: 12px;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.6),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(20px);
		min-width: 150px;
		pointer-events: none;
	}

	.tooltip-header {
		color: #10b981;
		font-weight: 600;
		margin-bottom: 8px;
		font-size: 14px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.tooltip-stat {
		color: rgba(255, 255, 255, 0.8);
		font-size: 12px;
		margin-bottom: 4px;
	}
</style>
