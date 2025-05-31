<script lang="ts">
	export let title: string = 'Loading chart...';
	export let height: string = '350px';
</script>

<div
	class="skeumorphic-shimmer-container"
	style="height: {height};"
	data-testid="chart-shimmer-loader"
>
	<!-- Chart Title Shimmer -->
	<div class="title-shimmer">
		<div class="shimmer-bar title-bar"></div>
	</div>

	<!-- Chart Area Shimmer -->
	<div class="chart-area-shimmer">
		<!-- Simulated chart elements -->
		<div class="chart-bars">
			<!-- Simulated bars/lines -->
			<div class="shimmer-bar chart-bar bar-1"></div>
			<div class="shimmer-bar chart-bar bar-2"></div>
			<div class="shimmer-bar chart-bar bar-3"></div>
			<div class="shimmer-bar chart-bar bar-4"></div>
			<div class="shimmer-bar chart-bar bar-5"></div>
		</div>

		<!-- Loading text -->
		<div class="loading-text">
			<span class="loading-label">{title}</span>
		</div>
	</div>
</div>

<style>
	.skeumorphic-shimmer-container {
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
		margin-bottom: 24px;
	}

	.title-shimmer {
		display: flex;
		justify-content: center;
		margin-bottom: 16px;
	}

	.title-bar {
		height: 24px;
		width: 200px;
		border-radius: 6px;
	}

	.chart-area-shimmer {
		position: relative;
		height: calc(100% - 60px);
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

	.chart-bars {
		position: absolute;
		bottom: 20px;
		left: 20px;
		right: 20px;
		height: 120px;
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 8px;
	}

	.chart-bar {
		flex: 1;
		border-radius: 4px 4px 0 0;
		max-width: 40px;
	}

	.bar-1 {
		height: 60%;
	}
	.bar-2 {
		height: 80%;
	}
	.bar-3 {
		height: 45%;
	}
	.bar-4 {
		height: 70%;
	}
	.bar-5 {
		height: 55%;
	}

	.loading-text {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-label {
		color: rgba(255, 255, 255, 0.6);
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		animation: pulse 2s ease-in-out infinite;
	}

	.shimmer-bar {
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.3) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
		border-radius: 4px;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}

	/* Animation delays for chart bars */
	.bar-1 {
		animation-delay: 0s;
	}
	.bar-2 {
		animation-delay: 0.2s;
	}
	.bar-3 {
		animation-delay: 0.4s;
	}
	.bar-4 {
		animation-delay: 0.6s;
	}
	.bar-5 {
		animation-delay: 0.8s;
	}
</style>
