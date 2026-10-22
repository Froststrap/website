<script lang="ts">
	let { class: className = 'size-5 shrink-0' }: { class?: string } = $props();
</script>

<svg
	class={className}
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
