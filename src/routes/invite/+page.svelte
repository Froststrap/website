<script lang="ts">
	import { page } from '$app/state';

	const WORKER_BASE = 'https://roblox-proxy.proxy-roblox.workers.dev';

	const formatCompactNumber = (num?: number): string => {
		if (num === undefined || num === null) return '-';
		return new Intl.NumberFormat('en-US', {
			notation: 'compact',
			maximumFractionDigits: 1
		}).format(num);
	};

	const buildRobloxUri = (placeId?: string | null, gameInstanceId?: string | null): string | null => {
		if (!placeId) return null;
		const params = new URLSearchParams();
		params.set('placeId', placeId);
		if (gameInstanceId) params.set('gameInstanceId', gameInstanceId);
		return `roblox://experiences/start?${params.toString()}`;
	};

	const buildWebFallbackUrl = (placeId?: string | null): string | null => {
		if (!placeId) return null;
		return `https://www.roblox.com/games/${encodeURIComponent(placeId)}`;
	};

	interface GameCreator {
		id: number;
		name: string;
	}

	interface GameDetails {
		id: number;
		rootPlaceId: number;
		name: string;
		description: string;
		creator?: GameCreator;
		playing?: number;
		visits?: number;
		maxPlayers?: number;
		[key: string]: unknown;
	}

	interface GameInfo {
		thumbnail?: string | null;
		details?: GameDetails | null;
	}

	const placeId = $derived(page.url.searchParams.get('placeId'));
	const gameInstanceId = $derived(page.url.searchParams.get('gameInstanceId'));

	let triedRedirect = $state(false);
	let thumbnailUrl = $state<string | null>(null);
	let gameName = $state('Unknown');
	let gameDetails = $state<GameDetails | null>(null);

	const robloxUri = $derived(buildRobloxUri(placeId, gameInstanceId));
	const webFallback = $derived(buildWebFallbackUrl(placeId));

	// Fetch game info from worker
	$effect(() => {
		if (!placeId) return;

		const url = `${WORKER_BASE}/api/gameInfo?placeId=${encodeURIComponent(placeId)}`;

		(async () => {
			try {
				const res = await fetch(url);
				if (!res.ok) throw new Error('Worker returned a non-200 status');

				const json: GameInfo = await res.json();
				thumbnailUrl = json.thumbnail ?? null;
				gameName = json.details?.name ?? 'Unknown';
				gameDetails = json.details ?? null;
			} catch (err) {
				console.error(err);
				thumbnailUrl = null;
				gameName = 'Unknown';
				gameDetails = null;
			}
		})();
	});

	// Auto-open Roblox
	$effect(() => {
		if (!robloxUri) return;

		const timer = window.setTimeout(() => {
			window.location.href = robloxUri;
			triedRedirect = true;
		}, 100);

		return () => window.clearTimeout(timer);
	});
</script>

<main class="min-h-[60vh] flex items-center justify-center p-6">
	<div class="max-w-3xl w-full flex gap-6 items-start">
		<!-- Thumbnail + Game Info -->
		<div class="w-48 flex-shrink-0">
<div class="w-48 h-48 rounded-md overflow-hidden bg-surface-muted relative">
			{#if !thumbnailUrl}
				<div class="w-full h-full flex items-center justify-center text-muted-foreground">
					No thumbnail
				</div>
			{:else}
				<img
					src={thumbnailUrl}
					alt="Game Thumbnail"
					class="w-full h-full object-cover"
					onerror={() => (thumbnailUrl = null)}
				/>
			{/if}
		</div>

		<div class="mt-2 text-center font-bold text-lg">{gameName}</div>

		{#if gameDetails?.creator?.name}
			<div class="text-center text-sm text-muted-foreground mt-1">
				by {gameDetails.creator.name}
			</div>
		{/if}
		</div>

		<!-- Right Side Content -->
		<div class="flex-1 text-left">
			<h1 class="text-xl mb-3 font-medium">Joining game...</h1>

			{#if !placeId}
				<p class="mb-3">
					Missing parameter <code>placeId</code>.
				</p>
			{:else}
				<p class="mb-3">
					Place ID: <strong>{placeId}</strong>
				</p>

				<p class="mb-3">
					Instance ID: <strong>{gameInstanceId}</strong>
				</p>

				<!-- Buttons -->
				<div class="flex gap-3 flex-wrap mb-6">
					{#if robloxUri}
						<a
							href={robloxUri}
							class="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary-hover transition"
						>
							Join Game
						</a>
					{/if}

					{#if webFallback}
						<a
							href={webFallback}
							target="_blank"
							rel="noopener noreferrer"
							class="px-4 py-2 border border-border rounded-md text-foreground bg-surface hover:bg-surface-muted transition"
						>
							View Game on Roblox Website
						</a>
					{/if}

					{#if triedRedirect}
						<p class="mt-4 text-muted-foreground text-sm">
							If nothing opened, click “Join Game”.
						</p>
					{/if}
				</div>

				<!-- Game Stats Tab -->
				{#if gameDetails}
					<div class="border-t border-border pt-4">
						<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
							Game Stats
						</h3>
						<div class="grid grid-cols-3 gap-4">
							<!-- Active / Playing -->
							<div class="bg-surface p-3 rounded-lg text-center border border-border">
								<div class="text-xs text-muted-foreground mb-1">Active</div>
								<div class="text-foreground text-lg">
									{formatCompactNumber(gameDetails.playing)}
								</div>
							</div>

							<!-- Visits -->
							<div class="bg-surface p-3 rounded-lg text-center border border-border">
								<div class="text-xs text-muted-foreground mb-1">Visits</div>
								<div class="text-foreground text-lg">
									{formatCompactNumber(gameDetails.visits)}
								</div>
							</div>

							<!-- Max Players -->
							<div class="bg-surface p-3 rounded-lg text-center border border-border">
								<div class="text-xs text-muted-foreground mb-1">
									Server Size
								</div>
								<div class="text-foreground text-lg">
									{gameDetails.maxPlayers}
								</div>
							</div>
						</div>
						{#if gameDetails.description}
							<div class="mt-4">
								<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
									Description
								</h3>
								<div class="bg-surface p-3 rounded-lg border border-border text-sm text-foreground whitespace-pre-wrap">
									{gameDetails.description}
								</div>
							</div>
						{/if}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</main>
