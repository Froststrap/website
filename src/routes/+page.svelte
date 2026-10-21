<script lang="ts">
	import { onMount } from 'svelte';
	import {
		RELEASES_URL,
		detectPlatform,
		fetchReleaseData,
		findAsset,
		formatCompactNumber,
		type Platform,
		type Release,
		type RepoStats
	} from '../lib/download';
	import ThemeToggle from '../lib/ThemeToggle.svelte';

	const githubUrl = 'https://github.com/Froststrap/Froststrap';
	const githubOrgUrl = 'https://github.com/Froststrap';
	const docsUrl = 'https://docs.froststrap.xyz';
	const discordUrl = 'https://discord.gg/froststrap';

	type Feature = {
		title: string;
		description: string;
	};

	const features: Feature[] = [
		{
			title: 'Cross-platform',
			description: 'Available on Windows, macOS, and Linux. On Linux, Roblox runs through Sober.'
		},
		{
			title: 'Mod generator',
			description:
				'Generate Roblox UI mods with custom colors, gradients, cursors, fonts, and more.'
		},
		{
			title: 'Themes & appearance',
			description:
				'Customize the launcher with animated or gradient backgrounds, fonts, and themes.'
		},
		{
			title: 'Region selector',
			description: 'Find and join servers in your preferred region for a better connection.'
		},
		{
			title: 'Discord Rich Presence',
			description: "Show the game, page, or dialog you're currently in on your Discord profile."
		},
		{
			title: 'Account manager',
			description: 'Switch between Roblox accounts, check presence, and launch games faster.'
		}
	];

	let platform = $state<Platform>('unknown');
	let release = $state<Release | null>(null);
	let stats = $state<RepoStats | null>(null);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement>();

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function dismissMenu() {
		closeMenu();
		menuButton?.focus();
	}

	$effect(() => {
		if (!menuOpen) {
			return;
		}

		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				dismissMenu();
			}
		};

		const closeOnScroll = () => closeMenu();

		document.addEventListener('keydown', closeOnEscape);
		window.addEventListener('scroll', closeOnScroll, { passive: true });

		return () => {
			document.removeEventListener('keydown', closeOnEscape);
			window.removeEventListener('scroll', closeOnScroll);
		};
	});

	$effect(() => {
		const desktop = window.matchMedia('(min-width: 64rem)');
		const closeOnDesktop = () => {
			if (desktop.matches) {
				closeMenu();
			}
		};

		desktop.addEventListener('change', closeOnDesktop);

		return () => desktop.removeEventListener('change', closeOnDesktop);
	});

	onMount(() => {
		platform = detectPlatform();

		const controller = new AbortController();

		fetchReleaseData(controller.signal)
			.then((data) => {
				release = data.release;
				stats = data.stats;
				status = 'ready';
			})
			.catch((error: unknown) => {
				if (error instanceof DOMException && error.name === 'AbortError') {
					return;
				}

				status = 'error';
			});

		return () => controller.abort();
	});

	const asset = $derived(release ? findAsset(release.assets, platform) : null);
	const alternateMacAsset = $derived(
		release && (platform === 'macos-arm64' || platform === 'macos-x64')
			? findAsset(release.assets, platform === 'macos-arm64' ? 'macos-x64' : 'macos-arm64')
			: null
	);
	const downloadUrl = $derived(asset?.browser_download_url ?? RELEASES_URL);
	const platformName = $derived.by(() => {
		switch (platform) {
			case 'windows':
				return 'Windows';
			case 'macos-arm64':
				return 'macOS (Apple Silicon)';
			case 'macos-x64':
				return 'macOS (Intel)';
			case 'linux':
				return 'Linux';
			case 'mobile':
				return 'Mobile';
			default:
				return null;
		}
	});
	const downloadLabel = $derived.by(() => {
		if (status === 'loading' || platform === 'unknown') {
			return 'Download latest release';
		}

		if (!asset) {
			return 'View latest release';
		}

		switch (platform) {
			case 'windows':
				return 'Download for Windows';
			case 'macos-arm64':
				return 'Download for macOS';
			case 'macos-x64':
				return 'Download for macOS (Intel)';
			case 'linux':
				return 'Download for Linux';
			default:
				return 'Download latest release';
		}
	});
</script>

<svelte:head>
	<title>Froststrap — A multi-platform bootstrapper</title>
	<meta
		name="description"
		content="Froststrap is a multi-platform bootstrapper based from Fishstrap. Download it for Windows, macOS, and Linux."
	/>
</svelte:head>

{#snippet bookIcon()}
	<svg
		class="size-5 shrink-0"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d="M12 7v14" />
		<path
			d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"
		/>
	</svg>
{/snippet}

{#snippet githubIcon()}
	<svg
		class="size-5 shrink-0"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
	>
		<path
			d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.8 1.08.8 2.18v3.23c0 .31.21.67.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"
		/>
	</svg>
{/snippet}

{#snippet discordIcon()}
	<svg
		class="size-5 shrink-0"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
	>
		<path
			d="M20.317 4.3698a19.7913 19.7913 0 0 0-4.8851-1.5152.0741.0741 0 0 0-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.8852 1.515.0699.0699 0 0 0-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 0 0 .0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 0 0 .0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 0 0-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 0 1-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 0 1 .0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 0 1 .0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 0 1-.0066.1276 12.2986 12.2986 0 0 1-1.873.8914.0766.0766 0 0 0-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 0 0 .0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 0 0 .0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 0 0-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"
		/>
	</svg>
{/snippet}

<header class="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background select-none">
	<div
		class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-8 px-8 py-4 sm:px-12"
	>
		<a
			class="inline-flex items-center gap-3 text-[1.40625rem] leading-7 font-bold tracking-[-0.02em]"
			href="/"
		>
			<img
				class="block size-[38px] select-none"
				src="/favicon.ico"
				alt=""
				width="38"
				height="38"
				draggable="false"
			/>
			<span>Froststrap</span>
		</a>

		<nav class="hidden items-center gap-2 lg:flex" aria-label="Primary">
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={githubUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				title="GitHub"
			>
				{@render githubIcon()}
			</a>
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={discordUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Discord"
				title="Discord"
			>
				{@render discordIcon()}
			</a>
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={docsUrl}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Docs"
				title="Docs"
			>
				{@render bookIcon()}
			</a>
			<ThemeToggle />
		</nav>

		<button
			bind:this={menuButton}
			type="button"
			class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-controls="mobile-menu"
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
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
				{#if menuOpen}
					<path d="M6 6l12 12M18 6 6 18" />
				{:else}
					<path d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</div>

	{#if menuOpen}
		<div id="mobile-menu" class="lg:hidden">
			<div
				class="mx-auto max-h-[calc(100dvh-4.5625rem)] w-full max-w-[1440px] overflow-y-auto px-8 pt-2 pb-5 sm:px-12"
			>
				<nav class="flex flex-col gap-1" aria-label="Primary">
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={docsUrl}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						{@render bookIcon()}
						Docs
					</a>
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={discordUrl}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						{@render discordIcon()}
						Discord
					</a>
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={githubUrl}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						{@render githubIcon()}
						GitHub
					</a>
				</nav>

				<div class="mt-4 flex justify-end">
					<ThemeToggle />
				</div>
			</div>
		</div>
	{/if}
</header>

{#if menuOpen}
	<button
		type="button"
		class="fixed inset-0 z-30 cursor-default bg-transparent outline-none lg:hidden"
		tabindex="-1"
		aria-label="Close menu"
		onclick={dismissMenu}
	></button>
{/if}

<main
	class="mx-auto grid w-full max-w-[1440px] gap-y-8 px-8 pt-[clamp(2.5rem,8vw,7rem)] pb-[clamp(1.25rem,4vw,3.5rem)] sm:px-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-x-12"
>
	<div class="contents lg:flex lg:flex-col lg:gap-8">
		<div class="order-1 min-w-0 text-center lg:order-none lg:text-left">
			<div
				class="mb-6 flex items-center justify-center gap-[clamp(0.75rem,2.5vw,1.6rem)] lg:justify-start"
			>
				<img
					class="block w-10 select-none sm:w-[4.6875rem] lg:w-[clamp(3rem,12vw,9rem)]"
					src="/favicon.ico"
					alt=""
					width="144"
					height="144"
					draggable="false"
				/>
				<h1
					class="m-0 text-[2.5rem] leading-[0.9] font-semibold tracking-[-0.06em] text-foreground transition-colors sm:text-[4.6875rem] lg:text-[clamp(3rem,9vw,6.75rem)]"
				>
					Froststrap
				</h1>
			</div>

			<p class="mx-auto max-w-[38rem] text-lead text-muted-foreground transition-colors lg:mx-0">
				A multi-platform bootstrapper based from Fishstrap.
			</p>
		</div>

		<div class="order-3 min-w-0 text-center lg:order-none lg:text-left">
			<div class="flex flex-col gap-3 xl:flex-row">
				{#if platform === 'mobile'}
					<button
						type="button"
						disabled
						class="inline-flex min-h-[3.75rem] w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-md border border-border bg-surface-muted px-6 py-3.5 text-body font-semibold text-muted-foreground opacity-70 select-none xl:flex-1"
					>
						Desktop Only
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
							<path
								d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"
							/>
						</svg>
					</button>
				{:else}
					<a
						class="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2.5 rounded-md border border-primary bg-primary px-6 py-3.5 text-body font-semibold text-primary-foreground transition-colors select-none hover:border-primary-hover hover:bg-primary-hover xl:flex-1"
						href={downloadUrl}
					>
						{downloadLabel}
						<span aria-hidden="true">↓</span>
					</a>
				{/if}
				<a
					class="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2.5 rounded-md border border-foreground/15 px-6 py-3.5 text-body font-semibold text-muted-foreground transition-colors select-none hover:border-foreground/25 hover:text-foreground xl:flex-1"
					href={githubUrl}
					target="_blank"
					rel="noopener noreferrer"
				>
					Star on GitHub
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
						<path
							d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
						/>
					</svg>
				</a>
			</div>

			<p class="mt-4 min-h-[1.3em] text-small text-muted-foreground transition-colors">
				{#if platform === 'mobile'}
					Froststrap is available for Windows, macOS, and Linux.
				{:else if status === 'loading'}
					Finding the latest release…
				{:else if status === 'error'}
					<a
						class="text-accent underline-offset-2 transition-colors hover:underline"
						href={RELEASES_URL}
					>
						Browse all releases
					</a> — couldn't reach GitHub.
				{:else if release}
					{platformName ? `${platformName} · ` : ''}Latest release {release.tag_name}
					{#if alternateMacAsset}
						<span class="whitespace-nowrap">
							-
							<a
								class="text-accent underline-offset-2 transition-colors hover:underline"
								href={alternateMacAsset.browser_download_url}
								aria-label={platform === 'macos-arm64'
									? 'Download the x64 build for Intel Macs'
									: 'Download the arm64 build for Apple Silicon'}
							>
								{platform === 'macos-arm64' ? 'Intel Mac?' : 'Apple Silicon?'}
							</a>
						</span>
					{/if}
				{/if}
			</p>

			{#if platform === 'windows'}
				<div class="mt-8 lg:max-w-[36rem]">
					<p class="mb-1.5 text-small text-muted-foreground transition-colors">Or install with:</p>
					<pre
						class="overflow-x-auto rounded-md border border-border bg-surface px-3 py-3 text-left sm:px-4 sm:py-3.5"><code
							class="font-mono text-small text-foreground transition-colors"
							>winget install Froststrap.Froststrap</code
						></pre>
				</div>
			{/if}

			{#if stats}
				<div
					class="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-body text-muted-foreground transition-colors lg:justify-start"
				>
					<span class="inline-flex items-center gap-2">
						<svg
							class="size-5 shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
							/>
						</svg>
						<span>
							<strong class="font-bold text-foreground transition-colors"
								>{formatCompactNumber(stats.stars)}</strong
							>
							stars
						</span>
					</span>
					<span class="inline-flex items-center gap-2">
						<svg
							class="size-5 shrink-0"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<path d="M12 4v16m7-7-7 7-7-7" />
						</svg>
						<span>
							<strong class="font-bold text-foreground transition-colors"
								>{formatCompactNumber(stats.downloads)}</strong
							>
							downloads
						</span>
					</span>
				</div>
			{/if}
		</div>
	</div>

	<figure class="order-2 m-0 w-full lg:order-none">
		<img
			class="block h-auto w-full rounded-xl border border-border/50 select-none"
			src="/linux.png"
			alt="Froststrap bootstrapper settings on Linux"
			width="1354"
			height="716"
			draggable="false"
		/>
	</figure>
</main>

<section id="features" aria-labelledby="features-title" class="scroll-mt-20">
	<div class="mx-auto w-full max-w-[1440px] px-8 pt-2 pb-[clamp(3.5rem,7vw,6rem)] sm:px-12">
		<h2
			id="features-title"
			class="m-0 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.045em] text-foreground transition-colors sm:text-[3.375rem]"
		>
			Features
		</h2>

		<div class="mt-8 grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
			{#each features as feature (feature.title)}
				<div class="min-w-0">
					<h3
						class="m-0 text-[1.375rem] leading-snug font-semibold text-foreground transition-colors md:text-[1.6875rem]"
					>
						{feature.title}
					</h3>
					<p class="mt-2 text-body text-muted-foreground transition-colors">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<footer class="mt-auto border-t border-border/50">
	<div
		class="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-4 px-8 pt-6 pb-10 text-small text-muted-foreground transition-colors sm:px-12 lg:flex-row lg:items-center"
	>
		<p class="m-0">
			Froststrap is a fork of Fishstrap, licensed under
			<a
				class="text-accent underline-offset-2 transition-colors hover:underline"
				href="https://choosealicense.com/licenses/mpl-2.0/"
				target="_blank"
				rel="noopener noreferrer">MPL-2.0</a
			>.
		</p>
		<div class="flex gap-5">
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href={githubUrl}
				target="_blank"
				rel="noopener noreferrer">GitHub</a
			>
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href={githubOrgUrl}
				target="_blank"
				rel="noopener noreferrer">GitHub Org</a
			>
		</div>
	</div>
</footer>
