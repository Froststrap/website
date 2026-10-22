export interface Feature {
	title: string;
	description: string;
}

export const features: Feature[] = [
	{
		title: 'Cross-platform',
		description: 'Available on Windows, macOS, and Linux. On Linux, Roblox runs through Sober.'
	},
	{
		title: 'Mod generator',
		description: 'Generate Roblox UI mods with custom colors, gradients, cursors, fonts, and more.'
	},
	{
		title: 'Themes & appearance',
		description: 'Customize the launcher with animated or gradient backgrounds, fonts, and themes.'
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
