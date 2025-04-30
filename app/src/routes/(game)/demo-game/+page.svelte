<script lang="ts">
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	let gameContainer: HTMLDivElement;
	let isLoading = true;
	let gameInitialized = false;
	let loadingProgress = 0;
	let loadingText = "Preparing the Hell...";
	let showControls = false;

	// Loading messages to cycle through
	const loadingMessages = [
		"Preparing the Hell...",
		"Setting up obstacles...",
		"Counting demons...",
		"Polishing the Hell...",
		"Setting up the Hell...",
		"Tying up Angels...",
		"Warming up the Hell..."
	];

	// Show the game canvas with a fade-in effect
	function handleGameReady() {
		setTimeout(() => {
			isLoading = false;
			gameInitialized = true;
		}, 500);
	}

	// Simulated loading progress
	function simulateLoading() {
		const interval = setInterval(() => {
			loadingProgress += Math.random() * 10;
			
			// Change loading message occasionally
			if (Math.random() > 0.7) {
				loadingText = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
			}
			
			if (loadingProgress >= 100) {
				loadingProgress = 100;
				clearInterval(interval);
				handleGameReady();
			}
		}, 300);
	}

	function toggleControls() {
		showControls = !showControls;
	}

	onMount(async () => {
		// Start the loading simulation
		simulateLoading();
		
		// Initialize the game
		const cleanup = await init();
		
		return () => {
			if (cleanup && typeof cleanup === 'function') {
				cleanup();
			}
		};
	});
</script>

<svelte:head>
	<title>Frog Hopper | Play Game</title>
	<meta name="description" content="Jump your frog to new heights in this exciting multiplayer game!">
</svelte:head>

<!-- Game container with fullscreen adjustment -->
<div class="game-wrapper">
	{#if isLoading}
		<div class="loading-screen" in:fade={{ duration: 300 }} out:fade={{ duration: 500 }}>
			<div class="frog-animation">
				<div class="frog">🐸</div>
				<div class="shadow"></div>
			</div>
			
			<h1>Hell Hopper</h1>
			<p>{loadingText}</p>
			
			<div class="progress-bar">
				<div class="progress-fill" style="width: {loadingProgress}%"></div>
			</div>
			
			<p class="loading-percentage">{Math.floor(loadingProgress)}%</p>
		</div>
	{/if}
	
	<!-- Game UI Overlay -->
	{#if gameInitialized}
		<div class="game-ui-overlay" transition:fade={{ duration: 500 }}>
			<button class="help-button" on:click={toggleControls}>
				{showControls ? 'X' : '?'}
			</button>
			
			{#if showControls}
				<div class="controls-panel" transition:fly={{ y: -20, duration: 300 }}>
					<h3>Controls</h3>
					<ul>
						<li><span class="key">W</span> or <span class="key">↑</span> - Jump</li>
						<li><span class="key">A</span> or <span class="key">←</span> - Move Left</li>
						<li><span class="key">D</span> or <span class="key">→</span> - Move Right</li>
						<li><span class="key">S</span> or <span class="key">↓</span> - Move Down</li>
						<li><span class="key">Space</span> - Super Jump</li>
					</ul>
					<h3>Goal</h3>
					<p>Jump as high as you can to reach the top of the leaderboard!</p>
				</div>
			{/if}
		</div>
	{/if}
	
	<!-- Fixed canvas size for the game -->
	<div 
		bind:this={gameContainer} 
		id="game-container" 
		class:visible={gameInitialized}
	></div>
</div>

