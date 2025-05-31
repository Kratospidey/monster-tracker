<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';
	import { browser } from '$app/environment';

	type $$Props = SonnerProps;

	// Simple theme detection with fallback
	let theme: 'light' | 'dark' | 'system' = 'system';

	// Try to get mode-watcher if available, but with fallback
	if (browser) {
		try {
			// Dynamically import mode-watcher only on client side
			import('mode-watcher')
				.then(({ mode }) => {
					if (mode && typeof mode.subscribe === 'function') {
						mode.subscribe((value) => {
							theme = value || 'system';
						});
					}
				})
				.catch(() => {
					// Fallback to system theme if mode-watcher fails
					theme = 'system';
				});
		} catch {
			theme = 'system';
		}
	}
</script>

<Sonner
	{theme}
	class="toaster group"
	toastOptions={{
		classes: {
			toast:
				'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
			description: 'group-[.toast]:text-muted-foreground',
			actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
			cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
		}
	}}
	{...$$restProps}
/>
