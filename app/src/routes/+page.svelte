<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';
	import Leaderboard from './Leaderboard.svelte';
</script>

<div class="container">
	<section>
		<h1>
			<span class="welcome">
				<picture>
					<source srcset={welcome} type="image/webp" />
					<img src={welcomeFallback} alt="Welcome" />
				</picture>
			</span>
			to your new<br />SvelteKit app
		</h1>

		<h2>try editing <strong>src/routes/+page.svelte</strong></h2>
		<Counter />
	</section>
	<Leaderboard />
</div>

<style>
	.container {
		display: flex;
		gap: 2rem;
		padding: 1rem;
		justify-content: center;
		align-items: flex-start;
	}

	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}

	@media (max-width: 768px) {
		.container {
			flex-direction: column;
			align-items: center;
		}
	}
</style>
