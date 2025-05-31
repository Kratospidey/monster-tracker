<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Button } from '$lib/components/ui/button';
	import { Card } from '$lib/components/ui/card';
	import { Toaster } from '$lib/components/ui/sonner';

	export let data;

	// Simple navigation state
	let isMobileMenuOpen = false;

	// Navigation items for authenticated users
	const navItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/charts', label: 'Analytics', icon: '📈' },
		{ href: '/library', label: 'Library', icon: '📚' },
		{ href: '/drinks', label: 'Drinks', icon: '🥤' },
		{ href: '/drinks/add', label: 'Add Drink', icon: '➕' }
	];

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	// Handle auth state changes
	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((event, session) => {
			if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});

	// Handle logout
	async function handleLogout() {
		await fetch('/auth/logout', { method: 'POST' });
		goto('/auth/login');
	}

	// Dynamic glare effect for navigation buttons
	function handleNavMouseMove(event: MouseEvent) {
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 100;
		const y = ((event.clientY - rect.top) / rect.height) * 100;

		target.style.setProperty('--glare-x', `${x}%`);
		target.style.setProperty('--glare-y', `${y}%`);
	}

	// Check if current page is auth page
	$: isAuthPage = $page.url.pathname.startsWith('/auth');

	// Client-side redirect to login if not authenticated and not on auth page
	$: if (browser && !data.session && !isAuthPage) {
		goto('/auth/login');
	}
</script>

<!-- Toast notifications -->
<Toaster position="top-right" richColors />

{#if isAuthPage}
	<!-- Auth pages don't need the main layout -->
	<slot />
{:else if data.session}
	<!-- Main app layout for authenticated users -->
	<div class="metal-background min-h-screen">
		<!-- Header -->
		<header class="metal-navbar shadow-lg">
			<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div class="flex h-16 items-center justify-between">
					<!-- App Title -->
					<div class="flex items-center">
						<a href="/" class="flex items-center space-x-2 transition-opacity hover:opacity-80">
							<div class="metal-logo flex h-8 w-8 items-center justify-center rounded-lg">
								<span class="text-lg font-bold text-white drop-shadow">M</span>
							</div>
							<h1 class="metal-text text-xl font-bold text-white drop-shadow-lg">
								Monster Tracker
							</h1>
						</a>
					</div>

					<!-- Desktop Navigation -->
					<nav class="hidden space-x-2 md:flex">
						{#each navItems as item}
							<a
								href={item.href}
								class="skeumorphic-nav-button flex items-center space-x-2 {$page.url.pathname ===
								item.href
									? 'skeumorphic-nav-active'
									: 'skeumorphic-nav-inactive'}"
								style="--glare-x: 50%; --glare-y: 50%;"
								on:mousemove={handleNavMouseMove}
							>
								<span class="drop-shadow">{item.icon}</span>
								<span class="drop-shadow">{item.label}</span>
							</a>
						{/each}
					</nav>

					<!-- Mobile menu button -->
					<Button
						variant="ghost"
						size="icon"
						class="metal-button-ghost md:hidden"
						on:click={toggleMobileMenu}
					>
						<span class="text-lg drop-shadow">☰</span>
					</Button>

					<!-- User menu -->
					<div class="hidden items-center space-x-4 md:flex">
						<span class="text-sm text-gray-300 drop-shadow">
							{data.session.user.email}
						</span>
						<button
							class="skeumorphic-button skeumorphic-button-secondary"
							style="--glare-x: 50%; --glare-y: 50%;"
							on:mousemove={handleNavMouseMove}
							on:click={handleLogout}
						>
							Sign out
						</button>
					</div>
				</div>
			</div>

			<!-- Mobile Navigation -->
			{#if isMobileMenuOpen}
				<div class="md:hidden">
					<div class="metal-mobile-menu space-y-1 px-2 pt-2 pb-3">
						{#each navItems as item}
							<a
								href={item.href}
								class="skeumorphic-nav-button-mobile block flex items-center space-x-2 {$page.url
									.pathname === item.href
									? 'skeumorphic-nav-active'
									: 'skeumorphic-nav-inactive'}"
								style="--glare-x: 50%; --glare-y: 50%;"
								on:mousemove={handleNavMouseMove}
								on:click={() => (isMobileMenuOpen = false)}
							>
								<span class="drop-shadow">{item.icon}</span>
								<span class="drop-shadow">{item.label}</span>
							</a>
						{/each}

						<!-- Mobile user menu -->
						<div class="mt-3 border-t border-gray-600 pt-3">
							<div class="px-3 py-2 text-sm text-gray-300 drop-shadow">
								{data.session.user.email}
							</div>
							<button
								class="skeumorphic-button skeumorphic-button-secondary w-full justify-start"
								style="--glare-x: 50%; --glare-y: 50%;"
								on:mousemove={handleNavMouseMove}
								on:click={handleLogout}
							>
								Sign out
							</button>
						</div>
					</div>
				</div>
			{/if}
		</header>

		<!-- Main Content -->
		<main class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<slot />
		</main>

		<!-- Floating Action Button (Mobile) -->
		{#if $page.url.pathname === '/'}
			<div class="fixed right-6 bottom-6 md:hidden">
				<a href="/drinks/add" class="metal-fab">
					<span class="text-2xl drop-shadow">+</span>
				</a>
			</div>
		{/if}
	</div>
{:else}
	<!-- Loading state or redirecting -->
	<div class="metal-background flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-400"></div>
			<p class="mt-2 text-sm text-gray-300 drop-shadow">Loading...</p>
		</div>
	</div>
{/if}

<style>
	/* Metal Background */
	.metal-background {
		background:
			radial-gradient(circle at 20% 80%, rgba(120, 113, 108, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			linear-gradient(135deg, #2c3e50 0%, #34495e 25%, #4a5a6a 50%, #34495e 75%, #2c3e50 100%);
		min-height: 100vh;
		position: relative;
	}

	.metal-background::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background:
			repeating-linear-gradient(
				90deg,
				transparent,
				transparent 2px,
				rgba(255, 255, 255, 0.03) 2px,
				rgba(255, 255, 255, 0.03) 4px
			),
			repeating-linear-gradient(
				0deg,
				transparent,
				transparent 2px,
				rgba(255, 255, 255, 0.03) 2px,
				rgba(255, 255, 255, 0.03) 4px
			);
		pointer-events: none;
	}

	/* Metal Navbar */
	.metal-navbar {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 100%
		);
		border-bottom: 1px solid #2d3748;
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.4),
			0 4px 12px rgba(0, 0, 0, 0.3),
			0 2px 6px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		position: relative;
	}

	.metal-text {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	/* Metal Logo */
	.metal-logo {
		background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%);
		border: 1px solid #14532d;
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Navigation Items - Skeumorphic Style */
	.skeumorphic-nav-button {
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 8px 16px;
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		transition: all 0.3s ease;
		cursor: pointer;
		overflow: hidden;
		text-decoration: none;
		backdrop-filter: blur(10px);
		color: white;
	}

	.skeumorphic-nav-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-radius: 8px 8px 0 0;
		pointer-events: none;
	}

	.skeumorphic-nav-button::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle 80px at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.15) 30%,
			transparent 70%
		);
		border-radius: 8px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.skeumorphic-nav-button:hover::after {
		opacity: 1;
	}

	.skeumorphic-nav-inactive {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.08) 0%,
			rgba(255, 255, 255, 0.03) 100%
		);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.skeumorphic-nav-inactive:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 100%
		);
		transform: translateY(-1px);
		box-shadow:
			0 6px 12px rgba(0, 0, 0, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.08);
	}

	.skeumorphic-nav-active {
		background: linear-gradient(145deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.25) 100%);
		border: 1px solid #2563eb;
		color: #93c5fd;
		box-shadow:
			0 4px 8px rgba(37, 99, 235, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.skeumorphic-nav-active:hover {
		background: linear-gradient(145deg, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.3) 100%);
		transform: translateY(-1px);
		box-shadow:
			0 6px 12px rgba(37, 99, 235, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.25),
			0 1px 0 rgba(255, 255, 255, 0.15);
	}

	/* Mobile Navigation Buttons */
	.skeumorphic-nav-button-mobile {
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 12px 16px;
		font-size: 16px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		transition: all 0.3s ease;
		cursor: pointer;
		overflow: hidden;
		text-decoration: none;
		backdrop-filter: blur(10px);
		color: white;
		margin-bottom: 4px;
	}

	.skeumorphic-nav-button-mobile::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.2) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-radius: 8px 8px 0 0;
		pointer-events: none;
	}

	.skeumorphic-nav-button-mobile::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle 100px at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.3) 0%,
			rgba(255, 255, 255, 0.15) 30%,
			transparent 70%
		);
		border-radius: 8px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.skeumorphic-nav-button-mobile:hover::after {
		opacity: 1;
	}

	/* Enhanced Skeumorphic Buttons */
	.skeumorphic-button {
		position: relative;
		border: none;
		border-radius: 8px;
		padding: 8px 16px;
		font-weight: 500;
		letter-spacing: 0.3px;
		transition: all 0.3s ease;
		cursor: pointer;
		overflow: hidden;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(10px);
	}

	.skeumorphic-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50%;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%);
		border-radius: 8px 8px 0 0;
		pointer-events: none;
	}

	.skeumorphic-button::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: radial-gradient(
			circle 60px at var(--glare-x, 50%) var(--glare-y, 50%),
			rgba(255, 255, 255, 0.4) 0%,
			rgba(255, 255, 255, 0.2) 20%,
			transparent 70%
		);
		border-radius: 8px;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.3s ease;
	}

	.skeumorphic-button:hover::after {
		opacity: 1;
	}

	.skeumorphic-button-secondary {
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		box-shadow:
			0 4px 8px rgba(51, 65, 85, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.2);
	}

	.skeumorphic-button-secondary:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-1px);
		box-shadow:
			0 6px 12px rgba(51, 65, 85, 0.4),
			0 3px 6px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	.skeumorphic-button-secondary:active {
		transform: translateY(0);
		box-shadow:
			0 2px 4px rgba(51, 65, 85, 0.3),
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 -1px 0 rgba(0, 0, 0, 0.3);
	}

	/* Buttons */
	.metal-button-ghost {
		background: transparent;
		border: 1px solid transparent;
		color: white;
		transition: all 0.3s ease;
	}

	.metal-button-ghost:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #374151;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	.metal-button-secondary {
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 14px;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.metal-button-secondary:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-button-secondary:active {
		transform: translateY(0);
		box-shadow:
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			inset 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	/* Floating Action Button */
	.metal-fab {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #16a34a 0%, #15803d 30%, #14532d 70%, #15803d 100%);
		color: white;
		border: 1px solid #14532d;
		box-shadow:
			0 8px 16px rgba(21, 128, 61, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.metal-fab:hover {
		background: linear-gradient(135deg, #15803d 0%, #14532d 30%, #0f172a 70%, #14532d 100%);
		transform: translateY(-2px);
		box-shadow:
			0 12px 24px rgba(21, 128, 61, 0.5),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.metal-fab:active {
		transform: translateY(0);
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			0 1px 2px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	/* Dark mode support */
	:global(.dark) .metal-background {
		background:
			radial-gradient(circle at 20% 80%, rgba(30, 30, 30, 0.3) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, rgba(60, 60, 60, 0.1) 0%, transparent 50%),
			linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%);
	}

	/* Mobile Menu */
	.metal-mobile-menu {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%);
		border-top: 1px solid #374151;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 4px 8px rgba(0, 0, 0, 0.3);
		backdrop-filter: blur(20px);
	}
</style>
