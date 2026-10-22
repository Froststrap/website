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
	import { features } from '../lib/features';
	import { GITHUB_URL } from '../lib/site';
	import Footer from '../lib/components/Footer.svelte';
	import Header from '../lib/components/Header.svelte';
	import Logo from '../lib/components/Logo.svelte';
	import DownloadIcon from '../lib/icons/DownloadIcon.svelte';
	import MonitorIcon from '../lib/icons/MonitorIcon.svelte';
	import StarIcon from '../lib/icons/StarIcon.svelte';

	let platform = $state<Platform>('unknown');
	let release = $state<Release | null>(null);
	let stats = $state<RepoStats | null>(null);
	let status = $state<'loading' | 'ready' | 'error'>('loading');

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
	<title>Froststrap - A multi-platform bootstrapper</title>
	<meta
		name="description"
		content="Froststrap is a multi-platform bootstrapper forked off Fishstrap, it is available on Windows, macOS, and Linux."
	/>
</svelte:head>

<Header />

<main
	class="mx-auto grid w-full max-w-[1440px] gap-y-8 px-8 pt-[clamp(2.5rem,8vw,7rem)] pb-[clamp(1.25rem,4vw,3.5rem)] sm:px-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-x-12"
>
	<div class="contents lg:flex lg:flex-col lg:gap-8">
		<div class="order-1 min-w-0 text-center lg:order-none lg:text-left">
			<div
				class="mb-6 flex items-center justify-center gap-[clamp(0.75rem,2.5vw,1.6rem)] lg:justify-start"
			>
				<Logo class="w-10 sm:w-[4.6875rem] lg:w-[clamp(3rem,12vw,9rem)]" width={144} height={144} />
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
						<MonitorIcon />
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
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
				>
					Star on GitHub
					<StarIcon />
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
					</a> - couldn't reach GitHub.
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
						<StarIcon />
						<span>
							<strong class="font-bold text-foreground transition-colors"
								>{formatCompactNumber(stats.stars)}</strong
							>
							stars
						</span>
					</span>
					<span class="inline-flex items-center gap-2">
						<DownloadIcon />
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
<Footer />
