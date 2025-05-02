<script lang="ts">
	import Header from '../Header.svelte';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>About HellHopper!</title>
	<meta name="description" content="Learn more about the HellHopper game" />
</svelte:head>
{#if !['/login', '/registration'].includes(page.url.pathname)}
	<Header />
{/if}
<div class="about-container">
	<div class="header">
		<span class="frog-icon">🐸</span>
		<h1>About HellHopper!</h1>
		<span class="frog-icon">🐸</span>
	</div>

	<div class="content-card">
		<h2>🐸 Hop or Hell: Race to Salvation</h2>
		<p>
			It's 1945 in frog years. The frog-atomic bombs have devastated your frog-city. As a virtuous
			frog, you expected a peaceful ascent to frog-heaven, but there's a problem...
		</p>
		<p>Due to budget cuts:</p>
		<ul>
			<li>Frog-heaven has limited capacity</li>
			<li>The stairway to heaven is broken</li>
			<li>Only the fastest hoppers will make it in</li>
		</ul>
		<p>Hop your way up before space runs out, or face eternal damnation in frog-hell!</p>
	</div>

	<div class="content-card">
		<h2>How to Play</h2>
		<p>
			Compete against other frogs in a real-time race to the top! The goal is simple: be one of the
			fastest hoppers to secure your spot in the limited-capacity frog-heaven.
		</p>
		<ul>
			<li>Engage in real-time multiplayer hopping.</li>
			<li>Climb the global leaderboard.</li>
			<li>Join the live lobby system to find matches.</li>
			<li>Customize your profile.</li>
			<li>Objective: Reach heaven before the spots run out!</li>
		</ul>
	</div>

	<div class="content-card">
		<h2>The Team & Tech</h2>
		<p>HellHopper was built with ❤️ using SvelteKit, PocketBase, and WebSockets.</p>
		<p>The project utilizes the following technologies:</p>
		<ul>
			<li>Frontend: SvelteKit</li>
			<li>Realtime: Custom WebSockets</li>
			<li>Database/Auth: PocketBase</li>
			<li>Styling: Tailwind CSS (Note: styles below are custom CSS)</li>
			<li>Testing: Vitest & Playwright</li>
			<li>Dev Environment: Docker + Docker Compose</li>
		</ul>
	</div>
</div>

<style>
	.about-container {
		max-width: 800px;
		margin: 2rem auto;
		padding: 1rem 2rem;
		background: rgba(33, 46, 29, 0.9);
		border-radius: 8px;
		border: 1px solid rgba(76, 175, 80, 0.3);
		color: #e0e0e0;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		border-bottom: 1px solid rgba(76, 175, 80, 0.3);
		padding-bottom: 1rem;
	}

	.frog-icon {
		font-size: 1.8rem;
		margin: 0 0.8rem;
	}

	h1 {
		color: #fff;
		text-align: center;
		margin: 0;
		font-size: 2rem;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.content-card {
		background: rgba(255, 255, 255, 0.05);
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 6px;
	}

	h2 {
		color: #a5d6a7;
		margin: 0 0 0.8rem 0;
		border-bottom: 1px solid rgba(76, 175, 80, 0.2);
		padding-bottom: 0.4rem;
		font-size: 1.3rem;
	}

	p {
		line-height: 1.6;
		margin-bottom: 0.8rem;
		color: #c8e6c9;
	}

	ul {
		list-style: disc;
		padding-left: 25px;
		margin-bottom: 0.8rem;
	}

	li {
		margin-bottom: 0.4rem;
	}

	a {
		color: #f4c03f;
	}

	a:hover {
		text-decoration: underline;
	}

	pre {
		background: rgba(0, 0, 0, 0.2);
		padding: 1rem;
		border-radius: 4px;
		overflow-x: auto;
		color: #eee;
	}
</style>
