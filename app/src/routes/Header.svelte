<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import { pb } from '$lib/pb/pocketbase';

	function getAvatarUrl(user: any) {
		return `${pb.baseUrl}/api/files/${user.collectionId || 'users_auth'}/${user.id}/${user.avatar}`;
	}

</script>

<header>
	<div class="corner">
		<a href="https://svelte.dev/docs/kit">
			<img src={logo} alt="SvelteKit" />
		</a>
	</div>

	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/sverdle') ? 'page' : undefined}>
				<a href="/sverdle">Sverdle</a>
			</li>
			<li aria-current={$page.url.pathname === '/chat' ? 'page' : undefined}>
				<a href="/chat">Chat Demo</a>
			</li>

			{#if pb.authStore.model }
				<li>
					<a><button on:click={() => { pb.authStore.clear(); window.location.href = '/'; }} class="nav-button">Logout</button></a>
				</li>
			{:else}
				<li aria-current={$page.url.pathname === '/login' ? 'page' : undefined}>
					<a href="/login">Login</a>
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
				{#if getAvatarUrl(pb.authStore.model)}
					<img src={getAvatarUrl(pb.authStore.model)} alt="Avatar" class="avatar" />
				{/if}
				<span class="username">
					{pb.authStore.model.name || pb.authStore.model.username || pb.authStore.model.email || 'User'}
				</span>
			</div>
		{/if}
		</div>

</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
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
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
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

	nav a, .nav-button {
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
		color: var(--color-theme-1);
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
	.username {
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

</style>