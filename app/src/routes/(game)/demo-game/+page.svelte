<script lang="ts">
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';

	onMount(async () => {
		await init();
	});

</script>
