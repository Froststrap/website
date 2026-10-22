<script lang="ts">
	import { DISCORD_URL, DOCS_URL, GITHUB_URL } from '../site';
	import BookIcon from '../icons/BookIcon.svelte';
	import DiscordIcon from '../icons/DiscordIcon.svelte';
	import GithubIcon from '../icons/GithubIcon.svelte';
	import MenuIcon from '../icons/MenuIcon.svelte';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

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
</script>

<header class="fixed inset-x-0 top-0 z-40 border-b border-border/50 bg-background select-none">
	<div
		class="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-8 px-8 py-4 sm:px-12"
	>
		<a
			class="inline-flex items-center gap-3 text-[1.40625rem] leading-7 font-bold tracking-[-0.02em]"
			href="/"
		>
			<Logo class="size-[38px]" width={38} height={38} />
			<span>Froststrap</span>
		</a>

		<nav class="hidden items-center gap-2 lg:flex" aria-label="Primary">
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={GITHUB_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="GitHub"
				title="GitHub"
			>
				<GithubIcon />
			</a>
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={DISCORD_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Discord"
				title="Discord"
			>
				<DiscordIcon />
			</a>
			<a
				class="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
				href={DOCS_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Docs"
				title="Docs"
			>
				<BookIcon />
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
			<MenuIcon open={menuOpen} />
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
						href={DOCS_URL}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						<BookIcon />
						Docs
					</a>
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={DISCORD_URL}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						<DiscordIcon />
						Discord
					</a>
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						<GithubIcon />
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
