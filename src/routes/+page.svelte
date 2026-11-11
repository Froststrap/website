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
	import { Check, Download, Monitor, Star, Terminal } from '@lucide/svelte';
	import AppleIcon from '../lib/icons/AppleIcon.svelte';
	import GithubIcon from '../lib/icons/GithubIcon.svelte';
	import LinuxIcon from '../lib/icons/LinuxIcon.svelte';
	import WindowsIcon from '../lib/icons/WindowsIcon.svelte';
	import Footer from '../lib/components/Footer.svelte';
	import Header from '../lib/components/Header.svelte';
	import Logo from '../lib/components/Logo.svelte';

	function reveal(node: HTMLElement) {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		node.classList.add('reveal');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.15 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	let copiedCommand = $state<string | null>(null);
	let copiedTimer: ReturnType<typeof setTimeout> | undefined;

	async function copyCommand(command: string, key: string) {
		try {
			await navigator.clipboard.writeText(command);
		} catch {
			return;
		}

		copiedCommand = key;
		clearTimeout(copiedTimer);
		copiedTimer = setTimeout(() => {
			copiedCommand = null;
		}, 1600);
	}

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

	const downloadColumns = $derived.by(() => {
		const url = (pattern: RegExp) =>
			release?.assets.find((candidate) => pattern.test(candidate.name))?.browser_download_url ??
			RELEASES_URL;

		return [
			{
				name: 'Windows',
				icon: WindowsIcon,
				links: [
					{ label: '.msi installer', href: url(/windows-x64\.msi$/i) },
					{ label: 'Winget', command: 'winget install Froststrap.Froststrap' },
					{ label: 'Scoop', command: 'scoop bucket add games; scoop install games/froststrap' }
				]
			},
			{
				name: 'Mac',
				icon: AppleIcon,
				links: [
					{ label: '.pkg · Apple Silicon', href: url(/macos-arm64-Setup\.pkg$/i) },
					{ label: '.pkg · Intel', href: url(/macos-x64-Setup\.pkg$/i) }
				]
			},
			{
				name: 'Linux',
				icon: LinuxIcon,
				links: [
					{ label: '.AppImage', href: url(/linux-x64\.AppImage$/i) },
					{ label: '.deb · Debian', href: url(/linux-x64\.deb$/i) },
					{ label: '.rpm · Fedora', href: url(/linux-x64\.rpm$/i) },
					{ label: '.pkg.tar.zst · Arch', href: url(/archlinux\.pkg\.tar\.zst$/i) },
					{ label: 'AUR', command: 'yay -S froststrap-bin' }
				]
			}
		];
	});
</script>

<svelte:head>
	<title>Froststrap - A multi-platform bootstrapper</title>
	<meta
		name="description"
		content="Froststrap is a multi-platform bootstrapper forked from Fishstrap. It is available on Windows, macOS, and Linux."
	/>
</svelte:head>

<Header />

<main
	class="relative mx-auto grid min-h-[calc(100dvh-4.625rem)] w-full gap-y-8 px-8 pt-[clamp(2.5rem,8vw,7rem)] pb-[clamp(1.25rem,4vw,3.5rem)] sm:px-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-x-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-x-12"
>
	<div
		aria-hidden="true"
		class="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[36rem] w-[min(72rem,140vw)] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow),transparent)]"
	></div>

	<div class="contents lg:flex lg:flex-col lg:gap-8">
		<div class="order-1 min-w-0 text-center lg:order-none lg:text-left">
			<div
				class="mb-6 flex items-center justify-center gap-[clamp(0.75rem,2.5vw,1.6rem)] lg:justify-start"
			>
				<Logo
					class="w-10 sm:w-[4.6875rem] lg:w-[clamp(2.5rem,6vw,4.5rem)]"
					width={144}
					height={144}
				/>
				<h1
					class="m-0 text-[2.5rem] leading-[0.9] font-semibold tracking-[-0.06em] text-foreground transition-colors sm:text-[4.6875rem] lg:text-[clamp(2.5rem,6.5vw,5.25rem)]"
				>
					Froststrap
				</h1>
			</div>

			<p class="mx-auto max-w-[38rem] text-lead text-muted-foreground transition-colors lg:mx-0">
				A multi-platform bootstrapper based on Fishstrap.
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
						Desktop only
						<Monitor class="size-5" />
					</button>
				{:else}
					<a
						class="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2.5 rounded-md border border-primary bg-primary px-6 py-3.5 text-body font-semibold text-primary-foreground select-none hover:-translate-y-px hover:border-primary-hover hover:bg-primary-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent xl:flex-1"
						href={downloadUrl}
					>
						{downloadLabel}
						<span aria-hidden="true">↓</span>
					</a>
				{/if}
				<a
					class="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2.5 rounded-md border border-foreground/15 px-6 py-3.5 text-body font-semibold text-muted-foreground select-none hover:border-foreground/25 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent xl:flex-1"
					href={GITHUB_URL}
					target="_blank"
					rel="noopener noreferrer"
				>
					Star on GitHub
					<GithubIcon class="size-5" />
				</a>
			</div>

			<p class="mt-4 min-h-[1.3em] text-small text-muted-foreground transition-colors">
				{#if platform === 'mobile'}
					Froststrap is available for Windows, macOS, and Linux.
				{:else if status === 'loading'}
					Finding the latest release…
				{:else if status === 'error'}
					Couldn't reach GitHub.
					<a
						class="text-accent underline-offset-2 transition-colors hover:underline"
						href={RELEASES_URL}
					>
						Browse all releases
					</a>
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
						<Star class="size-5" />
						<span>
							<strong class="font-bold text-foreground transition-colors"
								>{formatCompactNumber(stats.stars)}</strong
							>
							stars
						</span>
					</span>
					<span class="inline-flex items-center gap-2">
						<Download class="size-5" />
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
			class="block h-auto w-full rounded-xl border border-border/50 shadow-(--shadow-hero) select-none"
			src="/linux.png"
			alt="Froststrap bootstrapper settings on Linux"
			width="1354"
			height="716"
			draggable="false"
		/>
	</figure>
</main>

<section
	id="downloads"
	aria-labelledby="downloads-title"
	class="scroll-mt-[5.5rem] border-t border-border/50"
>
	<div class="mx-auto w-full px-8 pt-[clamp(3rem,7vw,5rem)] pb-[clamp(3.5rem,7vw,6rem)] sm:px-12">
		<h2
			id="downloads-title"
			class="m-0 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.045em] text-foreground transition-colors sm:text-[3.375rem]"
		>
			Downloads
		</h2>

		<p class="mt-3 max-w-[38rem] text-lead text-muted-foreground transition-colors">
			Pick a package for your platform from the latest release.
		</p>

		<div
			class="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-border/60"
		>
			{#each downloadColumns as column (column.name)}
				<div use:reveal class="flex flex-col items-center gap-4 text-center sm:px-8">
					<column.icon class="size-7 text-muted-foreground" />

					<h3
						class="m-0 text-[1.6875rem] leading-snug font-semibold text-foreground transition-colors"
					>
						{column.name}
					</h3>

					<ul class="m-0 flex list-none flex-col items-center gap-2.5 p-0">
						{#each column.links as link (link.label)}
							<li>
								{#if link.command}
									<button
										type="button"
										class="inline-flex items-center gap-1.5 text-accent underline-offset-2 transition-colors hover:text-accent-hover hover:underline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
										title={link.command}
										onclick={() => copyCommand(link.command ?? '', link.label)}
									>
										{#if copiedCommand === link.label}
											<Check class="size-4 shrink-0" aria-hidden="true" />
											Copied
										{:else}
											<Terminal class="size-4 shrink-0" aria-hidden="true" />
											{link.label}
										{/if}
									</button>
								{:else}
									<a
										class="inline-flex items-center gap-1.5 text-accent underline-offset-2 transition-colors hover:text-accent-hover hover:underline"
										href={link.href}
									>
										<Download class="size-4 shrink-0" aria-hidden="true" />
										{link.label}
									</a>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</div>
</section>

<section
	id="features"
	aria-labelledby="features-title"
	class="scroll-mt-[5.5rem] border-t border-border/50"
>
	<div class="mx-auto w-full px-8 pt-[clamp(3rem,7vw,5rem)] pb-[clamp(3.5rem,7vw,6rem)] sm:px-12">
		<h2
			id="features-title"
			class="m-0 text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.045em] text-foreground transition-colors sm:text-[3.375rem]"
		>
			Features
		</h2>

		<div class="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-6">
			{#each features as feature (feature.title)}
				<div
					use:reveal
					class="min-w-0 rounded-xl border border-border bg-surface p-6 shadow-(--shadow-card) hover:-translate-y-0.5 hover:border-accent/50"
				>
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
