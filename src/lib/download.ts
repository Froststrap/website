export type Platform = 'windows' | 'macos-arm64' | 'macos-x64' | 'linux' | 'mobile' | 'unknown';

export interface ReleaseAsset {
	name: string;
	browser_download_url: string;
	download_count?: number;
	size?: number;
}

export interface Release {
	tag_name: string;
	html_url: string;
	draft?: boolean;
	prerelease?: boolean;
	assets: ReleaseAsset[];
}

export interface RepoStats {
	stars: number;
	downloads: number;
}

export interface ReleaseData {
	release: Release;
	stats: RepoStats;
}

interface Repository {
	stargazers_count: number;
}

export const RELEASES_URL = 'https://github.com/Froststrap/Froststrap/releases/latest';

const REPOSITORY_API = 'https://api.github.com/repos/Froststrap/Froststrap';
const RELEASES_API = `${REPOSITORY_API}/releases?per_page=100`;

type NavigatorWithUserAgentData = Navigator & {
	userAgentData?: { architecture?: string; mobile?: boolean };
};

export function detectPlatform(): Platform {
	const userAgent = navigator.userAgent.toLowerCase();
	const userAgentData = (navigator as NavigatorWithUserAgentData).userAgentData;

	if (
		/android|iphone|ipad|ipod/.test(userAgent) ||
		userAgentData?.mobile === true ||
		(userAgent.includes('macintosh') && navigator.maxTouchPoints > 1)
	) {
		return 'mobile';
	}

	if (userAgent.includes('windows')) {
		return 'windows';
	}

	if (userAgent.includes('mac os') || userAgent.includes('macintosh')) {
		const architecture = (
			navigator as NavigatorWithUserAgentData
		).userAgentData?.architecture?.toLowerCase();

		if (architecture === 'x86' || architecture === 'x64') {
			return 'macos-x64';
		}

		return 'macos-arm64';
	}

	if (userAgent.includes('linux')) {
		return 'linux';
	}

	return 'unknown';
}

const assetPatterns: Record<Exclude<Platform, 'mobile' | 'unknown'>, RegExp[]> = {
	windows: [/windows.*\.msi$/i, /\.msi$/i],
	'macos-arm64': [/macos-arm64.*\.pkg$/i, /macos.*\.pkg$/i],
	'macos-x64': [/macos-x64.*\.pkg$/i, /macos.*\.pkg$/i],
	linux: [/linux.*\.appimage$/i, /linux.*\.deb$/i, /linux.*\.rpm$/i, /\.appimage$/i]
};

export function findAsset(assets: ReleaseAsset[], platform: Platform): ReleaseAsset | null {
	if (platform === 'mobile' || platform === 'unknown') {
		return null;
	}

	for (const pattern of assetPatterns[platform]) {
		const asset = assets.find((candidate) => pattern.test(candidate.name));

		if (asset) {
			return asset;
		}
	}

	return null;
}

async function githubFetch<T>(url: string, signal?: AbortSignal): Promise<T> {
	const response = await fetch(url, {
		headers: { Accept: 'application/vnd.github+json' },
		signal
	});

	if (!response.ok) {
		throw new Error(`GitHub API responded with ${response.status}`);
	}

	return (await response.json()) as T;
}

export async function fetchReleaseData(signal?: AbortSignal): Promise<ReleaseData> {
	const [repository, releases] = await Promise.all([
		githubFetch<Repository>(REPOSITORY_API, signal),
		githubFetch<Release[]>(RELEASES_API, signal)
	]);

	const release = releases.find((candidate) => !candidate.draft && !candidate.prerelease);

	if (!release) {
		throw new Error('No releases found');
	}

	const downloads = releases.reduce(
		(total, item) =>
			total + item.assets.reduce((sum, asset) => sum + (asset.download_count ?? 0), 0),
		0
	);

	return {
		release,
		stats: {
			stars: repository.stargazers_count,
			downloads
		}
	};
}

export function formatCompactNumber(value: number): string {
	return new Intl.NumberFormat('en', {
		notation: 'compact',
		maximumFractionDigits: 1
	})
		.format(value)
		.toLowerCase();
}
