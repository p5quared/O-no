<script lang="ts">
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';
	import GameLog from './GameLog.svelte';

	onMount(async () => {
		await init();
	});

</script>

<div class="min-h-full flex">
  <canvas id="game-canvas "/>
  <GameLog />
</div>
