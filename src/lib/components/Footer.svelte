<script lang="ts">
	import { GITHUB_ORG_URL, GITHUB_URL, LICENSE_URL } from '../site';
</script>

<footer class="mt-auto border-t border-border/50">
	<div
		class="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-4 px-8 pt-6 pb-10 text-small text-muted-foreground transition-colors sm:px-12 lg:flex-row lg:items-center"
	>
		<p class="m-0">
			Froststrap is a fork of Fishstrap, licensed under
			<a
				class="text-accent underline-offset-2 transition-colors hover:underline"
				href={LICENSE_URL}
				target="_blank"
				rel="noopener noreferrer">MPL-2.0</a
			>.
		</p>
		<div class="flex gap-5">
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href={GITHUB_URL}
				target="_blank"
				rel="noopener noreferrer">GitHub</a
			>
			<a
				class="text-muted-foreground transition-colors hover:text-foreground"
				href={GITHUB_ORG_URL}
				target="_blank"
				rel="noopener noreferrer">GitHub Org</a
			>
		</div>
	</div>
</footer>
