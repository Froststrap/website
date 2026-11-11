<script lang="ts">
	import { BookOpen, GitBranch, Menu, X } from '@lucide/svelte';
	import { DISCORD_URL, DOCS_URL, FORGEJO_URL, GITHUB_URL } from '../site';
	import DiscordIcon from '../icons/DiscordIcon.svelte';
	import ForgejoIcon from '../icons/ForgejoIcon.svelte';
	import GithubIcon from '../icons/GithubIcon.svelte';
	import Logo from './Logo.svelte';
	import ThemeToggle from './ThemeToggle.svelte';

	let menuOpen = $state(false);
	let menuButton = $state<HTMLButtonElement>();
	let gitOpen = $state(false);
	let gitMenu = $state<HTMLDivElement>();

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

	function toggleGitMenu() {
		gitOpen = !gitOpen;
	}

	function closeGitMenu() {
		gitOpen = false;
	}

	function onWindowPointerDown(event: PointerEvent) {
		if (gitOpen && !gitMenu?.contains(event.target as Node)) {
			closeGitMenu();
		}
	}

	function onWindowKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeGitMenu();
		}
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

<svelte:window onpointerdown={onWindowPointerDown} onkeydown={onWindowKeyDown} />

<header
	class="fixed inset-x-4 top-4 z-40 rounded-2xl border border-border/50 bg-background/75 shadow-(--shadow-island) backdrop-blur-md select-none"
>
	<div class="mx-auto flex w-full items-center justify-between gap-8 px-8 py-2.5 sm:px-12">
		<a
			class="inline-flex items-center gap-3 text-[1.40625rem] leading-7 font-bold tracking-[-0.02em]"
			href="/"
		>
			<Logo class="size-9" width={36} height={36} />
			<span>Froststrap</span>
		</a>

		<nav class="hidden items-center gap-2 lg:flex" aria-label="Primary">
			<div bind:this={gitMenu} class="relative">
				<button
					type="button"
					class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
					aria-label="Source code"
					title="Source code"
					aria-haspopup="true"
					aria-expanded={gitOpen}
					onclick={toggleGitMenu}
				>
					<GitBranch class="size-5" />
				</button>

				{#if gitOpen}
					<div
						class="absolute top-full right-0 z-10 mt-3 w-56 rounded-xl border border-border/60 bg-surface/95 p-1.5 shadow-(--shadow-island) backdrop-blur-md"
					>
						<a
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
							href={GITHUB_URL}
							target="_blank"
							rel="noopener noreferrer"
							onclick={closeGitMenu}
						>
							<GithubIcon />
							GitHub
						</a>
						<a
							class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
							href={FORGEJO_URL}
							target="_blank"
							rel="noopener noreferrer"
							onclick={closeGitMenu}
						>
							<ForgejoIcon />
							Forgejo
						</a>
					</div>
				{/if}
			</div>
			<a
				class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
				href={DISCORD_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Discord"
				title="Discord"
			>
				<DiscordIcon />
			</a>
			<a
				class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
				href={DOCS_URL}
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Docs"
				title="Docs"
			>
				<BookOpen class="size-5" />
			</a>
			<ThemeToggle />
		</nav>

		<button
			bind:this={menuButton}
			type="button"
			class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
			aria-label={menuOpen ? 'Close menu' : 'Open menu'}
			aria-controls="mobile-menu"
			aria-expanded={menuOpen}
			onclick={toggleMenu}
		>
			{#if menuOpen}<X class="size-5" />{:else}<Menu class="size-5" />{/if}
		</button>
	</div>

	{#if menuOpen}
		<div id="mobile-menu" class="lg:hidden">
			<div
				class="mx-auto max-h-[calc(100dvh-4.625rem)] w-full overflow-y-auto px-8 pt-2 pb-5 sm:px-12"
			>
				<nav class="flex flex-col gap-1" aria-label="Primary">
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={DOCS_URL}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						<BookOpen class="size-5" />
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
					<a
						class="flex items-center gap-3 rounded-md px-3 py-2.5 text-body font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
						href={FORGEJO_URL}
						target="_blank"
						rel="noopener noreferrer"
						onclick={closeMenu}
					>
						<ForgejoIcon />
						Forgejo
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
