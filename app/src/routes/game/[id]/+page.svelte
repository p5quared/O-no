<script lang="ts">
	import { page } from '$app/state';
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';

	const lobbyId = page.params.id

	onMount(async () => {
		init(lobbyId);
	});
</script>
