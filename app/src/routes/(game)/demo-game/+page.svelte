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

