<script lang="ts">
	import { pie, arc } from 'd3-shape';
	import { LayerChartService, type LayerChartData } from '../../../services/layerchart.service';
	import type { Drink } from '../../../types/drink';

	export let drinks: Drink[] = [];
	export let title: string = 'Rating Distribution';

	let chartData: LayerChartData;
	let hoveredSlice: any = null;
	let tooltip: { x: number; y: number; visible: boolean; data: any } = {
		x: 0,
		y: 0,
		visible: false,
		data: null
	};

	// Define proper types for our data
	interface RatingData {
		rating: number;
		ratingLabel: string;
		count: number;
		percentage: number;
	}

	type PieArcData = any; // Simplified type to avoid d3 type complexity

	$: {
		chartData = LayerChartService.getRatingDistributionData(drinks);
	}

	// Colors for each rating (1-5 stars: red to emerald)
	const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

	// Create pie generator
	$: pieGenerator = pie<RatingData>().value((d) => d.count);

	// Generate pie data
	$: pieData = pieGenerator(chartData.data as RatingData[]);

	// Arc generators - using any type to avoid complex d3 typing issues
	const arcGenerator: any = arc().innerRadius(65).outerRadius(120);
	const arcGeneratorHover: any = arc().innerRadius(65).outerRadius(130);

	function handleMouseMove(event: MouseEvent, d: PieArcData) {
		hoveredSlice = d;
		tooltip = {
			x: event.clientX,
			y: event.clientY,
			visible: true,
			data: d.data
		};
	}

	function handleMouseLeave() {
		hoveredSlice = null;
		tooltip.visible = false;
	}
</script>

<div class="skeumorphic-chart-container">
	<h3 class="skeumorphic-chart-title">{title}</h3>

	<div class="chart-wrapper" style="height: 340px;">
		{#if chartData.data.some((d) => d.count > 0)}
			<div class="donut-chart">
				<svg viewBox="0 0 360 340" class="chart-svg">
					<defs>
						<!-- Gradient definitions for each rating -->
						{#each colors as color, i}
							<linearGradient id="ratingGradient{i}" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:{color};stop-opacity:1" />
								<stop offset="50%" style="stop-color:{color};stop-opacity:0.8" />
								<stop offset="100%" style="stop-color:{color};stop-opacity:0.6" />
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
						{#each pieData as d, i}
							{@const isHovered = hoveredSlice === d}
							<path
								d={isHovered ? arcGeneratorHover(d) : arcGenerator(d)}
								fill="url(#ratingGradient{i})"
								stroke="rgba(255,255,255,0.3)"
								stroke-width="2"
								filter="url(#sliceShadow)"
								class="donut-slice"
								class:hovered={isHovered}
								on:mouseenter={(e) => handleMouseMove(e, d)}
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
						r="60"
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
						Total Drinks
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
						{drinks.length}
					</text>
				</svg>

				<!-- Legend -->
				<div class="legend">
					{#each chartData.data as d, i}
						{#if d.count > 0}
							<div class="legend-item">
								<div
									class="legend-color"
									style="background: linear-gradient(135deg, {colors[i]}, {colors[i]}88);"
								></div>
								<span class="legend-text">{d.ratingLabel} ({d.count})</span>
								<span class="legend-percentage">{d.percentage.toFixed(1)}%</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-chart">
				<p>No rating data available</p>
			</div>
		{/if}
	</div>

	<!-- Custom tooltip -->
	{#if tooltip.visible && tooltip.data}
		<div class="skeumorphic-tooltip" style="left: {tooltip.x + 10}px; top: {tooltip.y - 10}px;">
			<div class="tooltip-header">
				<strong>{tooltip.data.ratingLabel}</strong>
			</div>
			<div class="tooltip-content">
				<div class="tooltip-stat">Count: {tooltip.data.count}</div>
				<div class="tooltip-stat">Percentage: {tooltip.data.percentage.toFixed(1)}%</div>
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
