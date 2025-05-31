<script lang="ts">
	import { LayerChartService, type LayerChartData } from '../../../services/layerchart.service';
	import type { Drink } from '../../../types/drink';

	export let drinks: Drink[] = [];
	export let title: string = 'Drinks by Day of Week';

	let chartData: LayerChartData;
	let hoveredPoint: any = null;
	let tooltip: { x: number; y: number; visible: boolean; data: any } = {
		x: 0,
		y: 0,
		visible: false,
		data: null
	};

	$: {
		chartData = LayerChartService.getDrinksByDayOfWeekData(drinks);
	}

	function getGradientForDay(day: string): string {
		const gradientMap: Record<string, string> = {
			Monday: '#ef4444',
			Tuesday: '#f97316',
			Wednesday: '#eab308',
			Thursday: '#22c55e',
			Friday: '#10b981',
			Saturday: '#3b82f6',
			Sunday: '#8b5cf6'
		};
		return gradientMap[day] || '#64748b';
	}

	function handleMouseMove(event: MouseEvent, d: any) {
		hoveredPoint = d;
		tooltip = {
			x: event.clientX,
			y: event.clientY,
			visible: true,
			data: d
		};
	}

	function handleMouseLeave() {
		hoveredPoint = null;
		tooltip.visible = false;
	}

	function getBarColor(index: number, isHovered: boolean) {
		const colors = [
			'#3b82f6', // Monday - blue
			'#8b5cf6', // Tuesday - purple
			'#06b6d4', // Wednesday - cyan
			'#10b981', // Thursday - emerald
			'#f59e0b', // Friday - amber
			'#ef4444', // Saturday - red
			'#84cc16' // Sunday - lime
		];
		return isHovered ? colors[index] + 'ff' : colors[index] + 'cc';
	}
</script>

<div class="skeumorphic-chart-container">
	<h3 class="skeumorphic-chart-title">{title}</h3>

	<div class="chart-wrapper" style="height: 360px;">
		{#if chartData.data.length > 0}
			<div class="polar-chart">
				<svg viewBox="0 0 400 360" class="chart-svg">
					<defs>
						<!-- Enhanced gradient definitions for each day -->
						<linearGradient id="mondayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#ef4444;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#dc2626;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="tuesdayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#ea580c;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="wednesdayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#eab308;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#ca8a04;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="thursdayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#16a34a;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="fridayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#059669;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="saturdayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#2563eb;stop-opacity:0.7" />
						</linearGradient>
						<linearGradient id="sundayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
							<stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
							<stop offset="100%" style="stop-color:#7c3aed;stop-opacity:0.7" />
						</linearGradient>

						<filter id="polarGlow">
							<feGaussianBlur stdDeviation="4" result="coloredBlur" />
							<feMerge>
								<feMergeNode in="coloredBlur" />
								<feMergeNode in="SourceGraphic" />
							</feMerge>
						</filter>

						<filter id="polarShadow">
							<feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.3" />
						</filter>
					</defs>

					<!-- Grid circles -->
					{#each [0.3, 0.6, 0.9] as scale}
						<circle
							cx="200"
							cy="180"
							r={scale * 120}
							fill="none"
							stroke="rgba(255,255,255,0.03)"
							stroke-width="1"
						/>
					{/each}

					<!-- Data visualization -->
					<g transform="translate(200, 180)">
						{#each chartData.data as d, i}
							{@const angle = (i / 7) * 2 * Math.PI - Math.PI / 2}
							{@const maxCount = Math.max(...chartData.data.map((item) => item.count))}
							{@const radius = maxCount > 0 ? (d.count / maxCount) * 120 : 0}
							{@const x = Math.cos(angle) * radius}
							{@const y = Math.sin(angle) * radius}
							{@const labelX = Math.cos(angle) * 135}
							{@const labelY = Math.sin(angle) * 135}

							<!-- Radial line -->
							<line
								x1="0"
								y1="0"
								x2={x}
								y2={y}
								stroke={getGradientForDay(d.day)}
								stroke-width="3"
								filter="url(#polarShadow)"
								class="radial-line"
								class:hovered={hoveredPoint === d}
								on:mouseenter={(e) => handleMouseMove(e, d)}
								on:mouseleave={handleMouseLeave}
								role="button"
								tabindex="0"
							/>

							<!-- Data point -->
							<circle
								cx={x}
								cy={y}
								r={hoveredPoint === d ? 7 : 5}
								fill={getGradientForDay(d.day)}
								stroke="rgba(255,255,255,0.9)"
								stroke-width="2"
								filter="url(#polarGlow)"
								class="data-point"
								class:hovered={hoveredPoint === d}
								on:mouseenter={(e) => handleMouseMove(e, d)}
								on:mouseleave={handleMouseLeave}
								role="button"
								tabindex="0"
							/>

							<!-- Day labels -->
							<text
								x={labelX}
								y={labelY}
								text-anchor="middle"
								dominant-baseline="middle"
								fill="rgba(255,255,255,0.9)"
								font-size="13"
								font-weight="600"
								class="day-label"
							>
								{d.day}
							</text>
						{/each}
					</g>
				</svg>
			</div>
		{:else}
			<div class="empty-chart">
				<p>No day of week data available</p>
			</div>
		{/if}
	</div>

	<!-- Custom tooltip -->
	{#if tooltip.visible && tooltip.data}
		<div class="skeumorphic-tooltip" style="left: {tooltip.x + 10}px; top: {tooltip.y - 10}px;">
			<div class="tooltip-header">
				<strong>{tooltip.data.day}</strong>
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

	.polar-chart {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 20px;
	}

	.chart-svg {
		width: 100%;
		height: 100%;
		max-width: 400px;
		max-height: 400px;
	}

	.radial-line,
	.data-point {
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.radial-line:hover,
	.radial-line.hovered {
		filter: url(#polarGlow);
	}

	.day-label {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
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
