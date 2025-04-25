<script lang="ts">
	import { page } from '$app/state';
	import { init } from '$lib/kaplay/game';
	import { onDestroy, onMount } from 'svelte';

	const urlParams = page.url.searchParams;
	const name = urlParams.get('name') ?? 'xxx';

	let destroy: () => void;
	onMount(async () => {
		destroy = await init(name);
	});

	onDestroy(() => {
			destroy();
	});
</script>
