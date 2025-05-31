<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { scaleBand, scaleLinear } from 'd3-scale';
	import { LayerChartService, type LayerChartData } from '../../../services/layerchart.service';
	import type { Drink } from '../../../types/drink';

	export let drinks: Drink[] = [];
	export let title: string = 'Drinks by Series';

	let chartData: LayerChartData;
	let hoveredBar: any = null;
	let tooltip: { x: number; y: number; visible: boolean; data: any } = {
		x: 0,
		y: 0,
		visible: false,
		data: null
	};

	$: {
		chartData = LayerChartService.getDrinksBySeriesData(drinks);
	}

	function getSeriesColor(series: string): string {
		const seriesColors = {
			normal: '#64748b',
			ultra: '#3b82f6',
			juice: '#f97316',
			reserve: '#8b5cf6',
			special: '#ef4444'
		};

		return (
			seriesColors[series.toLowerCase() as keyof typeof seriesColors] || seriesColors['normal']
		);
	}

	function handleMouseMove(event: MouseEvent, d: any) {
		hoveredBar = d;
		tooltip = {
			x: event.clientX,
			y: event.clientY,
			visible: true,
			data: d
		};
	}

	function handleMouseLeave() {
		hoveredBar = null;
		tooltip.visible = false;
	}
</script>

<div class="skeumorphic-chart-container">
	<h3 class="skeumorphic-chart-title">{title}</h3>

	<div class="chart-wrapper" style="height: 320px;">
		{#if chartData.data.length > 0}
			<LayerCake
				padding={{ top: 20, right: 20, bottom: 70, left: 80 }}
				x="series"
				y="count"
				xScale={scaleBand().paddingInner(0.2).paddingOuter(0.1)}
				yScale={scaleLinear()}
				data={chartData.data}
			>
				<Svg>
					<defs>
						<!-- Dynamic gradient definitions for each series -->
						{#each chartData.data as d, i}
							{@const baseColor = getSeriesColor(d.series)}
							<linearGradient id="barGradient{i}" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" style="stop-color:{baseColor};stop-opacity:1" />
								<stop offset="50%" style="stop-color:{baseColor};stop-opacity:0.8" />
								<stop offset="100%" style="stop-color:{baseColor};stop-opacity:0.6" />
							</linearGradient>

							<linearGradient id="barGradientHover{i}" x1="0%" y1="0%" x2="0%" y2="100%">
								<stop offset="0%" style="stop-color:{baseColor};stop-opacity:1" />
								<stop offset="50%" style="stop-color:{baseColor};stop-opacity:0.9" />
								<stop offset="100%" style="stop-color:{baseColor};stop-opacity:0.7" />
							</linearGradient>
						{/each}

						<filter id="barShadow">
							<feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.4" />
						</filter>

						<filter id="barGlow">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						<linearGradient id="chartBg" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
							<stop offset="100%" style="stop-color:rgba(255,255,255,0.02);stop-opacity:1" />
						</linearGradient>
					</defs>

					<!-- Chart background -->
					<rect
						width="100%"
						height="100%"
						fill="url(#chartBg)"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
						rx="8"
					/>

					<!-- Y-axis grid lines -->
					{#each [0, 0.25, 0.5, 0.75, 1] as tick}
						<line
							x1="0"
							x2="100%"
							y1="{100 - tick * 100}%"
							y2="{100 - tick * 100}%"
							stroke="rgba(255,255,255,0.05)"
							stroke-width="1"
						/>
					{/each}

					<!-- Bars -->
					<g class="bars">
						{#each chartData.data as d, i}
							{@const xPos =
								(i / chartData.data.length) * 100 + (100 / chartData.data.length) * 0.1}
							{@const barWidth = (100 / chartData.data.length) * 0.8}
							{@const maxCount = Math.max(...chartData.data.map((item) => item.count))}
							{@const barHeight = (d.count / maxCount) * 75}

							<rect
								x="{xPos}%"
								y="{100 - barHeight - 5}%"
								width="{barWidth}%"
								height="{barHeight}%"
								fill={hoveredBar === d ? `url(#barGradientHover${i})` : `url(#barGradient${i})`}
								stroke="rgba(255,255,255,0.3)"
								stroke-width="1"
								filter="url(#barShadow)"
								class="chart-bar"
								class:hovered={hoveredBar === d}
								on:mouseenter={(e) => handleMouseMove(e, d)}
								on:mouseleave={handleMouseLeave}
								rx="3"
								role="button"
								tabindex="0"
							/>

							<!-- Series label on bar -->
							<text
								x="{xPos + barWidth / 2}%"
								y="{100 - barHeight / 2 - 5}%"
								text-anchor="middle"
								dominant-baseline="middle"
								fill="rgba(255,255,255,0.9)"
								font-size="11"
								font-weight="600"
								class="bar-label"
								style="pointer-events: none;"
							>
								{d.series}
							</text>

							<!-- Count label on top of bar -->
							<text
								x="{xPos + barWidth / 2}%"
								y="{100 - barHeight - 10}%"
								text-anchor="middle"
								fill="rgba(255,255,255,0.95)"
								font-size="13"
								font-weight="700"
								class="count-label"
								style="pointer-events: none; text-shadow: 0 1px 2px rgba(0,0,0,0.8);"
							>
								{d.count}
							</text>
						{/each}
					</g>
				</Svg>
			</LayerCake>
		{:else}
			<div class="empty-chart">
				<p>No series data available</p>
			</div>
		{/if}
	</div>

	<!-- Custom tooltip -->
	{#if tooltip.visible && tooltip.data}
		<div class="skeumorphic-tooltip" style="left: {tooltip.x + 10}px; top: {tooltip.y - 10}px;">
			<div class="tooltip-header" style="color: {getSeriesColor(tooltip.data.series)};">
				<strong>{tooltip.data.series}</strong>
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

	.chart-bar {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.chart-bar:hover,
	.chart-bar.hovered {
		filter: url(#barGlow);
		stroke-width: 2;
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

	.count-label {
		font-weight: 700;
	}

	.bar-label {
		font-weight: 600;
	}
</style>
