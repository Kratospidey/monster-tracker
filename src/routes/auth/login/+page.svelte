<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Separator } from '$lib/components/ui/separator';
	import {
		AlertCircle,
		Loader2,
		Eye,
		EyeOff,
		Mail,
		Lock,
		LogIn,
		CheckCircle2
	} from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	export let form;

	let loading = false;
	let email = '';
	let password = '';
	let showPassword = false;
	let emailFocused = false;
	let passwordFocused = false;
	let rememberMe = false;

	// Real-time email validation
	$: emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	$: isValidForm = email && password.length >= 6 && emailValid;

	onMount(() => {
		// Check for URL parameters
		const urlParams = new URLSearchParams(window.location.search);
		const message = urlParams.get('message');
		const error = urlParams.get('error');

		if (message) {
			toast.success(decodeURIComponent(message));
		}
		if (error) {
			toast.error(decodeURIComponent(error));
		}

		// Auto-fill email if coming from signup
		const savedEmail = urlParams.get('email');
		if (savedEmail) {
			email = decodeURIComponent(savedEmail);
		}
	});

	$: if (form?.error) {
		toast.error(form.error);
	}
</script>

<svelte:head>
	<title>Sign In - Monster Tracker</title>
	<meta
		name="description"
		content="Sign in to your Monster Tracker account to continue tracking your energy drink consumption."
	/>
</svelte:head>

<div class="metal-background flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md space-y-8">
		<!-- Header -->
		<div class="space-y-2 text-center">
			<div class="flex items-center justify-center space-x-2">
				<div class="metal-logo flex h-10 w-10 items-center justify-center rounded-lg">
					<span class="text-xl font-bold text-white drop-shadow">M</span>
				</div>
				<span class="text-2xl font-bold text-white drop-shadow-lg">Monster Tracker</span>
			</div>
			<h1 class="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Welcome back</h1>
			<p class="text-gray-300 drop-shadow">Sign in to your account to continue tracking</p>
		</div>

		<!-- Main Card -->
		<Card class="metal-card shadow-2xl">
			<CardHeader class="metal-header space-y-1 pb-4">
				<CardTitle class="text-2xl font-semibold text-white drop-shadow-lg">Sign in</CardTitle>
				<CardDescription class="text-gray-300 drop-shadow"
					>Enter your credentials to access your dashboard</CardDescription
				>
			</CardHeader>

			<CardContent class="space-y-6">
				<form
					method="POST"
					action="?/login"
					use:enhance={() => {
						loading = true;
						return async ({ result, update }) => {
							loading = false;
							if (result.type === 'redirect') {
								toast.success('Welcome back!');
								goto('/');
							} else {
								await update();
							}
						};
					}}
				>
					<div class="space-y-4">
						<!-- Email Field -->
						<div class="space-y-2">
							<Label for="email" class="flex items-center gap-2 text-white drop-shadow">
								<Mail class="h-4 w-4" />
								Email address
							</Label>
							<div class="relative">
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="monster@energy.com"
									bind:value={email}
									on:focus={() => (emailFocused = true)}
									on:blur={() => (emailFocused = false)}
									required
									disabled={loading}
									class="metal-input pl-4 transition-all duration-200 {emailFocused
										? 'metal-input-focused'
										: ''} 
										   {email && !emailValid ? 'metal-input-error' : ''} 
										   {email && emailValid ? 'metal-input-success' : ''}"
								/>
								{#if email && emailValid}
									<CheckCircle2 class="absolute top-3 right-3 h-4 w-4 text-green-400" />
								{/if}
							</div>
							{#if email && !emailValid}
								<p class="flex items-center gap-1 text-sm text-red-400 drop-shadow">
									<AlertCircle class="h-3 w-3" />
									Please enter a valid email address
								</p>
							{/if}
						</div>

						<!-- Password Field -->
						<div class="space-y-2">
							<Label for="password" class="flex items-center gap-2 text-white drop-shadow">
								<Lock class="h-4 w-4" />
								Password
							</Label>
							<div class="relative">
								<Input
									id="password"
									name="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									bind:value={password}
									on:focus={() => (passwordFocused = true)}
									on:blur={() => (passwordFocused = false)}
									required
									disabled={loading}
									class="metal-input pr-10 transition-all duration-200 {passwordFocused
										? 'metal-input-focused'
										: ''}"
								/>
								<button
									type="button"
									class="absolute top-3 right-3 text-gray-400 transition-colors hover:text-white"
									on:click={() => (showPassword = !showPassword)}
								>
									{#if showPassword}
										<EyeOff class="h-4 w-4" />
									{:else}
										<Eye class="h-4 w-4" />
									{/if}
								</button>
							</div>
						</div>

						<!-- Remember Me & Forgot Password -->
						<div class="flex items-center justify-between">
							<div class="flex items-center space-x-2">
								<input
									type="checkbox"
									id="remember"
									bind:checked={rememberMe}
									class="metal-checkbox rounded border-gray-600 text-blue-500 focus:ring-blue-500"
								/>
								<Label for="remember" class="cursor-pointer text-sm text-gray-300 drop-shadow"
									>Remember me</Label
								>
							</div>
							<a href="/auth/forgot-password" class="metal-link text-sm"> Forgot password? </a>
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={loading || !isValidForm}
							class="metal-button-primary h-11 w-full text-base font-medium"
						>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Signing in...
							{:else}
								<LogIn class="mr-2 h-4 w-4" />
								Sign in
							{/if}
						</button>
					</div>
				</form>

				<!-- Divider -->
				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="metal-separator w-full"></div>
					</div>
					<div class="relative flex justify-center text-xs uppercase">
						<span
							class="px-2 text-gray-300 drop-shadow"
							style="background: linear-gradient(145deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);"
							>Don't have an account?</span
						>
					</div>
				</div>

				<!-- Sign Up Link -->
				<a href="/auth/signup" class="metal-button-secondary h-11 w-full">Create account</a>
			</CardContent>
		</Card>

		<!-- Footer -->
		<p class="text-center text-sm text-gray-300 drop-shadow">
			By signing in, you agree to our{' '}
			<a href="/terms" class="metal-link underline underline-offset-4"> Terms of Service </a>{' '}
			and{' '}
			<a href="/privacy" class="metal-link underline underline-offset-4"> Privacy Policy </a>
		</p>
	</div>
</div>

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

	/* Metal Logo */
	.metal-logo {
		background: linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%);
		border: 1px solid #14532d;
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Card */
	.metal-card {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #2d3748;
		box-shadow:
			0 8px 32px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
	}

	.metal-header {
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border-bottom: 1px solid #374151;
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Metal Inputs */
	.metal-input {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		border: 1px solid #1a202c;
		color: white;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.3s ease;
		backdrop-filter: blur(10px);
	}

	.metal-input::placeholder {
		color: rgba(255, 255, 255, 0.6);
	}

	.metal-input-focused {
		border-color: #2563eb;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.15),
			0 1px 0 rgba(255, 255, 255, 0.1),
			0 0 0 2px rgba(37, 99, 235, 0.3);
	}

	.metal-input-error {
		border-color: #dc2626;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05),
			0 0 0 2px rgba(220, 38, 38, 0.3);
	}

	.metal-input-success {
		border-color: #16a34a;
		box-shadow:
			inset 0 2px 4px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05),
			0 0 0 2px rgba(22, 163, 74, 0.3);
	}

	/* Metal Checkbox */
	.metal-checkbox {
		background: linear-gradient(145deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
		border: 1px solid #374151;
		box-shadow:
			inset 0 1px 2px rgba(0, 0, 0, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-checkbox:checked {
		background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
		border-color: #1d4ed8;
		box-shadow:
			0 2px 4px rgba(37, 99, 235, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Separator */
	.metal-separator {
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(45, 55, 72, 0.8) 20%,
			rgba(113, 128, 150, 0.6) 50%,
			rgba(45, 55, 72, 0.8) 80%,
			transparent 100%
		);
		border: none;
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	/* Metal Buttons */
	.metal-button-primary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: linear-gradient(135deg, #16a34a 0%, #15803d 30%, #14532d 70%, #15803d 100%);
		color: white;
		border: 1px solid #14532d;
		font-weight: 600;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		box-shadow:
			0 4px 8px rgba(21, 128, 61, 0.4),
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.metal-button-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, #15803d 0%, #14532d 30%, #0f172a 70%, #14532d 100%);
		transform: translateY(-1px);
		box-shadow:
			0 6px 12px rgba(21, 128, 61, 0.5),
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4),
			0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.metal-button-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.metal-button-secondary {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 8px;
		background: linear-gradient(135deg, #64748b 0%, #475569 30%, #334155 70%, #475569 100%);
		color: #f8fafc;
		border: 1px solid #334155;
		font-weight: 500;
		text-decoration: none;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 1px 0 rgba(255, 255, 255, 0.05);
		transition: all 0.2s ease;
	}

	.metal-button-secondary:hover {
		background: linear-gradient(135deg, #475569 0%, #334155 30%, #1e293b 70%, #334155 100%);
		transform: translateY(-1px);
		box-shadow:
			0 4px 8px rgba(0, 0, 0, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.metal-button-ghost {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 12px;
		border-radius: 6px;
		background: transparent;
		color: #d1d5db;
		border: 1px solid transparent;
		font-weight: 500;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.metal-button-ghost:hover {
		background: linear-gradient(
			145deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 100%
		);
		border: 1px solid #374151;
		color: white;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.1),
			0 1px 0 rgba(255, 255, 255, 0.05);
	}

	/* Metal Links */
	.metal-link {
		color: #93c5fd;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
		transition: all 0.2s ease;
	}

	.metal-link:hover {
		color: #bfdbfe;
		text-shadow: 0 1px 3px rgba(147, 197, 253, 0.3);
	}
</style>
