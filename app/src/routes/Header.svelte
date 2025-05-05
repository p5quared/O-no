<script lang="ts">
	import { page } from '$app/state';
	import logo from '$lib/images/frogdeath.png';
	import { pb } from '$lib/pb/pocketbase';
	import ProfilePicture from './ProfilePicture.svelte';
</script>

<header>
	<div class="corner">
		<img src={logo} alt="SvelteKit" />
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/" style="font-family: 'FrogFont', sans-serif;">Home</a>
			</li>
			<li aria-current={page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about" style="font-family: 'FrogFont', sans-serif;">About</a>
			</li>
			<li aria-current={page.url.pathname === '/chat' ? 'page' : undefined}>
				<a href="/chat" style="font-family: 'FrogFont', sans-serif;">Chat</a>
			</li>

			{#if pb.authStore.model}
				<li aria-current={page.url.pathname === '/achievements' ? 'page' : undefined}>
					<a href="/achievements" style="font-family: 'FrogFont', sans-serif;">Achievements</a>
				</li>
				<li aria-current={page.url.pathname === '/profile' ? 'page' : undefined}>
					<a href="/profile" style="font-family: 'FrogFont', sans-serif;">Profile</a>
				</li>
				<li>
					<a
						><button
							on:click={() => {
								pb.authStore.clear();
								window.location.href = '/';
							}}
							class="nav-button"
							style="font-family: 'FrogFont', sans-serif;">Logout</button
						></a
					>
				</li>
			{:else}
				<li aria-current={page.url.pathname === '/login' ? 'page' : undefined}>
					<a href="/login" style="font-family: 'FrogFont', sans-serif;">Login</a>
				</li>
			{/if}
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>
	<div class="user-corner">
		{#if pb.authStore.model}
			<div class="user-info">
				<ProfilePicture />
				<span class="name">
					Logged in as: {pb.authStore.model.name ?? 'User'}
				</span>
			</div>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		background: #212e1d;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 3em;
		height: 3em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: #4e6042;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a,
	.nav-button {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}
	a:hover,
	.nav-button:hover {
		color: #ffffff;
	}
	.user-corner {
		width: 3em;
		height: 3em;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.8rem;
		background-color: rgba(255, 255, 255, 0.7);
		border-radius: 2rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		max-width: none;
		width: auto;
		position: absolute;
		right: 0;
		min-width: 12em;
	}
	.name {
		font-size: 0.9rem;
		font-weight: bold;
		color: var(--color-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 14em;
	}
	.avatar {
		width: 1.8em;
		height: 1.8em;
		border-radius: 50%;
		object-fit: cover;
		border: 2px solid white;
	}
	:global(header) {
		position: relative;
		z-index: 10;
	}
</style>
