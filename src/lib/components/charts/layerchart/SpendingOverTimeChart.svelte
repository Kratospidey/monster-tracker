<script lang="ts">
	import { LayerCake, Svg } from 'layercake';
	import { scaleLinear, scaleTime } from 'd3-scale';
	import {
		LayerChartService,
		type SpendingOverTimeData
	} from '../../../services/layerchart.service';
	import type { Drink } from '../../../types/drink';
	import Line from './components/Line.svelte';
	import Points from './components/Points.svelte';
	import AxisX from './components/AxisX.svelte';
	import AxisY from './components/AxisY.svelte';

	export let drinks: Drink[] = [];
	export let title: string = 'Spending Over Time';

	let chartData: SpendingOverTimeData;
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
		chartData = LayerChartService.getSpendingOverTimeData(drinks);
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

	<div class="chart-wrapper" style="height: 300px;">
		{#if chartData.data.length > 0}
			<LayerCake
				padding={{ top: 20, right: 20, bottom: 40, left: 80 }}
				x="date"
				y="amount"
				xScale={scaleTime()}
				yScale={scaleLinear()}
				yNice={true}
				data={chartData.data}
			>
				<Svg>
					<!-- Chart background -->
					<defs>
						<linearGradient id="chartBg" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" style="stop-color:rgba(255,255,255,0.1);stop-opacity:1" />
							<stop offset="100%" style="stop-color:rgba(255,255,255,0.02);stop-opacity:1" />
						</linearGradient>

						<filter id="glowEffect">
							<feGaussianBlur stdDeviation="3" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						<filter id="dropShadow">
							<feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.3" />
						</filter>
					</defs>

					<rect
						width="100%"
						height="100%"
						fill="url(#chartBg)"
						stroke="rgba(255,255,255,0.1)"
						stroke-width="1"
						rx="8"
					/>

					<!-- Axis components for labels -->
					<AxisY />
					<AxisX />

					<!-- Chart data -->
					<Line />
					<Points {handleMouseMove} {handleMouseLeave} />
				</Svg>
			</LayerCake>
		{:else}
			<div class="empty-chart">
				<p>No spending data available</p>
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
				<strong>{tooltip.data.dateString || 'Data Point'}</strong>
			</div>
			<div class="tooltip-content">
				<div class="tooltip-total">Total: ${(tooltip.data.amount || 0).toFixed(2)}</div>
				{#if chartData.hoverData[tooltip.data.dateString]}
					<div class="tooltip-details">
						{#each chartData.hoverData[tooltip.data.dateString] as drink}
							<div class="tooltip-drink">
								<span class="drink-time">{drink.time}</span>
								<span class="drink-name">{drink.name}</span>
								<span class="drink-cost">${drink.cost.toFixed(2)}</span>
							</div>
						{/each}
					</div>
				{/if}
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
		min-width: 200px;
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
		color: #10b981;
		font-weight: 600;
		margin-bottom: 8px;
		font-size: 14px;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.tooltip-total {
		color: rgba(255, 255, 255, 0.9);
		font-weight: 600;
		margin-bottom: 8px;
		font-size: 16px;
	}

	.tooltip-details {
		margin-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		padding-top: 8px;
	}

	.tooltip-drink {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
		font-size: 12px;
	}

	.drink-time {
		color: rgba(255, 255, 255, 0.6);
		font-size: 10px;
		min-width: 50px;
	}

	.drink-name {
		color: rgba(255, 255, 255, 0.8);
		flex: 1;
		margin: 0 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.drink-cost {
		color: #10b981;
		font-weight: 600;
		min-width: 45px;
		text-align: right;
	}
</style>
