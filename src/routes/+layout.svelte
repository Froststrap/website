<script lang="ts">
	import './layout.css';
	import type { LayoutProps } from './$types';
	import Background from '../lib/components/Background.svelte';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
</svelte:head>

<Background />

{@render children()}
