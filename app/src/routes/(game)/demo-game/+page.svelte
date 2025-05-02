<script lang="ts">
	import { init } from '$lib/kaplay/game';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	// Just track if loading is shown or not
	let isLoading = true;
	let loadingProgress = 0;
	let loadingText = 'Preparing the Hell...';

	// Loading messages to cycle through
	const loadingMessages = [
		'Preparing the Hell...',
		'Setting up obstacles...',
		'Counting demons...',
		'Polishing the flames...',
		'Setting up torture devices...',
		'Tying up Angels...',
		'Warming up the lava...'
	];

	// Just for visual effect, doesn't block game loading
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

				// Allow a moment at 100% before hiding
				setTimeout(() => {
					isLoading = false;
				}, 500);
			}
		}, 300);
	}

	onMount(() => {
		// Start the game initialization immediately
		init().catch((error) => {
			console.error('Game initialization failed:', error);
		});

		// Start the loading simulation
		simulateLoading();
	});
</script>

<svelte:head>
	<title>Hell Hopper | Play Game</title>
	<meta
		name="description"
		content="Jump through the flames of hell in this infernal multiplayer game!"
	/>
</svelte:head>

<!-- Main game container with overlay -->
<div class="root-container">
	<!-- Overlay loading screen -->
	{#if isLoading}
		<div class="loading-screen" in:fade={{ duration: 300 }} out:fade={{ duration: 800 }}>
			<!-- Fire embers/sparks -->
			<div class="ember ember1"></div>
			<div class="ember ember2"></div>
			<div class="ember ember3"></div>
			<div class="ember ember4"></div>
			<div class="ember ember5"></div>
			<div class="ember ember6"></div>
			<div class="ember ember7"></div>
			<div class="ember ember8"></div>

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
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.root-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		/* No background so game can render */
	}

	.loading-screen {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 999;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background: linear-gradient(135deg, #500, #800);
		background-color: #500; /* Fallback color */
		color: #fff;
		pointer-events: none; /* Allow clicks to pass through */
		position: relative;
		overflow: hidden;
	}

	/* Lava/fire effect background */
	.loading-screen::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background:
			radial-gradient(circle at 20% 50%, rgba(255, 0, 0, 0.5) 0%, rgba(255, 0, 0, 0) 25%),
			radial-gradient(circle at 50% 30%, rgba(255, 50, 0, 0.5) 0%, rgba(255, 50, 0, 0) 35%),
			radial-gradient(circle at 80% 70%, rgba(255, 100, 0, 0.5) 0%, rgba(255, 100, 0, 0) 30%);
		z-index: -1;
		animation: lavaMove 8s infinite alternate;
	}

	/* Fire particles */
	.loading-screen::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 40%;
		background:
			radial-gradient(circle at 10% 100%, rgba(255, 100, 0, 0.8) 0%, rgba(255, 100, 0, 0) 20%),
			radial-gradient(circle at 30% 100%, rgba(255, 50, 0, 0.7) 0%, rgba(255, 50, 0, 0) 25%),
			radial-gradient(circle at 50% 100%, rgba(255, 150, 0, 0.8) 0%, rgba(255, 150, 0, 0) 30%),
			radial-gradient(circle at 70% 100%, rgba(255, 50, 0, 0.7) 0%, rgba(255, 50, 0, 0) 25%),
			radial-gradient(circle at 90% 100%, rgba(255, 100, 0, 0.8) 0%, rgba(255, 100, 0, 0) 20%);
		z-index: -1;
		animation: fireFlicker 3s infinite alternate;
	}

	@keyframes lavaMove {
		0% {
			opacity: 0.8;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
		100% {
			opacity: 0.9;
			transform: scale(1.02);
		}
	}

	@keyframes fireFlicker {
		0% {
			opacity: 0.7;
			height: 40%;
		}
		50% {
			opacity: 0.9;
			height: 43%;
		}
		100% {
			opacity: 0.8;
			height: 41%;
		}
	}

	.loading-screen h1 {
		font-size: 3.5rem;
		margin-bottom: 1rem;
		color: #ff5500;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
		font-family: 'FrogFont', sans-serif;
		letter-spacing: 2px;
		position: relative;
		z-index: 2;
	}

	.loading-screen p {
		font-size: 1.2rem;
		margin-bottom: 2rem;
		color: #ff9977;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
		position: relative;
		z-index: 2;
	}

	.progress-bar {
		width: 300px;
		height: 20px;
		background-color: rgba(20, 0, 0, 0.6);
		border-radius: 10px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
		position: relative;
		z-index: 2;
		border: 1px solid rgba(255, 100, 0, 0.3);
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #ff3300, #ff7700);
		transition: width 0.3s ease;
		border-radius: 10px;
		box-shadow: 0 0 8px rgba(255, 100, 0, 0.8);
	}

	.loading-percentage {
		margin-top: 0.5rem;
		font-size: 1rem;
		color: #ff5500;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
		position: relative;
		z-index: 2;
	}

	/* Bouncing frog animation */
	.frog-animation {
		position: relative;
		height: 100px;
		margin-bottom: 2rem;
		z-index: 2;
	}

	.frog {
		font-size: 5rem;
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		animation: bounce 1.5s infinite;
		filter: drop-shadow(0 0 10px rgba(255, 100, 0, 0.8));
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
		0%,
		100% {
			bottom: 0;
		}
		50% {
			bottom: 60px;
			transform: translateX(-50%) rotate(10deg);
		}
	}

	@keyframes shadow {
		0%,
		100% {
			width: 60px;
			opacity: 0.3;
		}
		50% {
			width: 40px;
			opacity: 0.15;
		}
	}

	/* Floating ember/spark particles */
	.ember {
		position: absolute;
		width: 6px;
		height: 6px;
		background-color: #ff7700;
		border-radius: 50%;
		filter: blur(1px);
		box-shadow: 0 0 6px 2px rgba(255, 150, 0, 0.8);
		opacity: 0;
		z-index: 5;
		animation: floatUp 5s infinite;
	}

	.ember1 {
		left: 20%;
		bottom: 0;
		animation-delay: 0.5s;
	}
	.ember2 {
		left: 30%;
		bottom: 10%;
		animation-delay: 1.5s;
	}
	.ember3 {
		left: 45%;
		bottom: 5%;
		animation-delay: 0.7s;
	}
	.ember4 {
		left: 60%;
		bottom: 15%;
		animation-delay: 2.2s;
	}
	.ember5 {
		left: 75%;
		bottom: 0;
		animation-delay: 1.1s;
	}
	.ember6 {
		left: 85%;
		bottom: 10%;
		animation-delay: 0.3s;
	}
	.ember7 {
		left: 15%;
		bottom: 20%;
		animation-delay: 1.8s;
	}
	.ember8 {
		left: 65%;
		bottom: 5%;
		animation-delay: 2.5s;
	}

	@keyframes floatUp {
		0% {
			transform: translateY(0) scale(1);
			opacity: 0;
		}
		10% {
			opacity: 0.8;
		}
		90% {
			opacity: 0.3;
		}
		100% {
			transform: translateY(-100vh) scale(0.5) rotate(360deg);
			opacity: 0;
		}
	}
</style>
