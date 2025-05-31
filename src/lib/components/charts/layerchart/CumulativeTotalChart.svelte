<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import { LayerChartService, type LayerChartData } from '../../../services/layerchart.service';
	import type { Drink } from '../../../types/drink';
	import Line from './components/Line.svelte';
	import Points from './components/Points.svelte';
	import AxisX from './components/AxisX.svelte';
	import AxisY from './components/AxisY.svelte';

	export let drinks: Drink[] = [];
	export let title: string = 'Cumulative Total Cans';

	let chartData: LayerChartData;
	let hoveredPoint: any = null;
	let chartContainer: HTMLDivElement;
	let tooltip: { x: number; y: number; visible: boolean; data: any; position: 'top' | 'bottom' } = {
		x: 0,
		y: 0,
		visible: false,
		data: null,
		position: 'top'
	};

	$: {
		chartData = LayerChartService.getCumulativeTotalCansData(drinks);
	}

	function handleMouseMove(event: MouseEvent, d: any) {
		if (!chartContainer) return;

		hoveredPoint = d;
		const rect = chartContainer.getBoundingClientRect();
		const chartRect = chartContainer.querySelector('.chart-wrapper')?.getBoundingClientRect();

		if (!chartRect) return;

		// Get point position relative to the chart container
		const pointX = event.clientX - chartRect.left;
		const pointY = event.clientY - chartRect.top;

		// Determine if tooltip should be above or below the point
		const shouldShowAbove = pointY > chartRect.height / 2;

		tooltip = {
			x: pointX,
			y: pointY,
			visible: true,
			data: d,
			position: shouldShowAbove ? 'top' : 'bottom'
		};
	}

	function handleMouseLeave() {
		hoveredPoint = null;
		tooltip.visible = false;
	}
</script>

<div class="skeumorphic-chart-container" bind:this={chartContainer}>
	<h3 class="skeumorphic-chart-title">{title}</h3>

	<div class="chart-wrapper" style="height: 350px;">
		{#if chartData.data.length > 0}
			<LayerCake
				padding={{ top: 25, right: 25, bottom: 40, left: 80 }}
				x="date"
				y="total"
				xScale={scaleTime()}
				yScale={scaleLinear()}
				yNice={true}
				data={chartData.data}
			>
				<Svg>
					<defs>
						<!-- Gradient definitions -->
						<linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style="stop-color:#6366f1;stop-opacity:0.8" />
							<stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:0.4" />
							<stop offset="100%" style="stop-color:#a855f7;stop-opacity:0.1" />
						</linearGradient>

						<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
							<stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
						</linearGradient>

						<filter id="areaGlow">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						<filter id="pointShadow">
							<feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" />
						</filter>

						<filter id="lineShadow">
							<feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.4" />
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

					<!-- Axis components for proper scaling -->
					<AxisY />
					<AxisX />

					<!-- Chart data using LayerCake components -->
					<Line color="url(#lineGradient)" strokeWidth={3} />
					<Points {handleMouseMove} {handleMouseLeave} fill="#8b5cf6" />
				</Svg>
			</LayerCake>
		{:else}
			<div class="empty-chart">
				<p>No cumulative data available</p>
			</div>
		{/if}
	</div>

	<!-- Chart-relative tooltip -->
	{#if tooltip.visible && tooltip.data}
		<div
			class="chart-tooltip"
			class:tooltip-top={tooltip.position === 'top'}
			class:tooltip-bottom={tooltip.position === 'bottom'}
			style="left: {tooltip.x}px; top: {tooltip.y}px;"
		>
			<div class="tooltip-header">
				<strong>{tooltip.data.dateString}</strong>
			</div>
			<div class="tooltip-content">
				<div class="tooltip-stat">Total Cans: {tooltip.data.total}</div>
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

	.empty-chart {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
	}

	.chart-tooltip {
		position: absolute;
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
		transform: translateX(-50%);
	}

	.tooltip-top {
		transform: translateX(-50%) translateY(-100%) translateY(-10px);
	}

	.tooltip-bottom {
		transform: translateX(-50%) translateY(10px);
	}

	.tooltip-header {
		color: #8b5cf6;
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
