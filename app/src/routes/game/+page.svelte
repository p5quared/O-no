<script lang="ts">
	import { page } from '$app/state';
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';

	const urlParams = page.url.searchParams;
	const name = urlParams.get('name') ?? 'xxx';

	onMount(async () => {
		init(name);
	});
</script>
