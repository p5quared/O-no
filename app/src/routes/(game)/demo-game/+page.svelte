<script lang="ts">
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';
	import GameLog from './GameLog.svelte';

	onMount(async () => {
		await init();
	});

</script>

<div class="game-container">
  <canvas id="game-canvas" />
  <GameLog />
</div>

<style>
  .game-container {
    display: flex;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  
  canvas {
    flex: 1;
  }
</style>
