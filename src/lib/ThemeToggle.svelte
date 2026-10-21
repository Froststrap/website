<script lang="ts">
	import { onMount } from 'svelte';

	type Theme = 'light' | 'dark';

	let theme = $state<Theme>('light');
	let colorSchemeTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

		return () => clearTimeout(colorSchemeTimer);
	});

	function toggleTheme() {
		theme = theme === 'dark' ? 'light' : 'dark';

		document.documentElement.dataset.theme = theme;
		clearTimeout(colorSchemeTimer);
		colorSchemeTimer = setTimeout(() => {
			document.documentElement.style.colorScheme = theme;
		}, 250);

		try {
			localStorage.setItem('froststrap-theme', theme);
		} catch {
			return;
		}
	}

	const label = $derived(theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<span class="inline-flex text-muted-foreground transition-colors hover:text-foreground">
	<button
		type="button"
		class="inline-flex size-10 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
		aria-label={label}
		title={label}
		onclick={toggleTheme}
	>
		{#if theme === 'dark'}
			<svg
				class="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="4" />
				<path
					d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
				/>
			</svg>
		{:else}
			<svg
				class="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
			</svg>
		{/if}
	</button>
</span>
