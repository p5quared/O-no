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
		"Polishing the flames...",
		"Setting up torture devices...",
		"Tying up Angels...",
		"Warming up the lava..."
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
	<title>Hell Hopper | Play Game</title>
	<meta name="description" content="Jump through the flames of hell in this infernal multiplayer game!">
</svelte:head>

<!-- Game container with fullscreen adjustment -->
<div class="game-wrapper">
	{#if isLoading}
		<div class="loading-screen" in:fade={{ duration: 300 }} out:fade={{ duration: 500 }}>
			<div class="frog-animation">
				<div class="frog">🔥</div>
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
					<p>Jump as high as you can to escape the fires of hell!</p>
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

<style>
	:global(body) {
		margin: 0;
		overflow: hidden;
		background-color: #1a0505;
	}
	
	.game-wrapper {
		position: relative;
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #1a0505;
	}
	
	#game-container {
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.5s ease;
	}
	
	#game-container.visible {
		opacity: 1;
	}
	
	.loading-screen {
		position: absolute;
		z-index: 100;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #300a0a 0%, #501010 100%);
		color: #fff;
	}
	
	.loading-screen h1 {
		font-size: 3.5rem;
		margin-bottom: 1rem;
		color: #ff5500;
		text-shadow: 0 2px 8px rgba(255, 0, 0, 0.7);
		font-family: 'FrogFont', sans-serif;
		letter-spacing: 2px;
	}
	
	.loading-screen p {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		color: #ff9977;
	}
	
	.progress-bar {
		width: 300px;
		height: 20px;
		background-color: rgba(50, 0, 0, 0.4);
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #ff3300, #ff7700);
		transition: width 0.3s ease;
		border-radius: 10px;
		box-shadow: 0 0 8px rgba(255, 50, 0, 0.8);
	}
	
	.loading-percentage {
		margin-top: 0.5rem;
		font-size: 1rem;
		color: #ff5500;
	}
	
	/* Bouncing frog animation */
	.frog-animation {
		position: relative;
		height: 100px;
		margin-bottom: 2rem;
	}
	
	.frog {
		font-size: 5rem;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		animation: bounce 1.5s infinite;
		filter: drop-shadow(0 0 10px rgba(255, 50, 0, 0.7));
	}
	
	.shadow {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 15px;
		background: rgba(255, 0, 0, 0.3);
		border-radius: 50%;
		animation: shadow 1.5s infinite;
	}
	
	@keyframes bounce {
		0%, 100% {
			bottom: 0;
		}
		50% {
			bottom: 60px;
			transform: translateX(-50%) rotate(10deg);
		}
	}
	
	@keyframes shadow {
		0%, 100% {
			width: 60px;
			opacity: 0.3;
		}
		50% {
			width: 40px;
			opacity: 0.15;
		}
	}
	
	/* Game UI Overlay */
	.game-ui-overlay {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 50;
		padding: 1rem;
	}
	
	.help-button {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background-color: rgba(120, 30, 30, 0.8);
		color: white;
		border: 2px solid rgba(255, 100, 50, 0.6);
		cursor: pointer;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
		transition: all 0.2s ease;
	}
	
	.help-button:hover {
		background-color: rgba(150, 40, 20, 0.9);
		transform: scale(1.05);
	}
	
	.controls-panel {
		position: absolute;
		top: 60px;
		right: 1rem;
		background-color: rgba(40, 10, 5, 0.85);
		padding: 1rem;
		border-radius: 12px;
		width: 250px;
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		border: 1px solid rgba(200, 50, 0, 0.3);
	}
	
	.controls-panel h3 {
		font-size: 1.2rem;
		margin: 0.5rem 0;
		color: #ff7700;
		border-bottom: 1px solid rgba(255, 100, 0, 0.3);
		padding-bottom: 0.3rem;
	}
	
	.controls-panel ul {
		padding-left: 1.5rem;
		margin: 0.5rem 0 1rem;
	}
	
	.controls-panel li {
		margin-bottom: 0.5rem;
	}
	
	.controls-panel p {
		margin: 0.5rem 0;
		font-size: 0.9rem;
		color: #ffd0b0;
	}
	
	.key {
		display: inline-block;
		background-color: rgba(255, 50, 0, 0.2);
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
		font-weight: bold;
		min-width: 1rem;
		text-align: center;
		border: 1px solid rgba(255, 100, 0, 0.3);
	}
</style>
