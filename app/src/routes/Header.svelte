<script lang="ts">
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import { currentUser, pb } from '$lib/pb/pocketbase';

	function handleLogout() {
		pb.authStore.clear();
	}

	$: navItems = [
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' },
		{ name: 'Sverdle', path: '/sverdle' },
		{ name: 'Chat Demo', path: '/chat' }
	];

	function getAvatarUrl(user) {
		if (!user || !user.avatar) return '';
		const pocketbaseUrl =
			typeof window !== 'undefined'
				? import.meta.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090'
				: 'http://localhost:8090';
		return `${pocketbaseUrl}/api/files/${user.collectionId || 'users_auth'}/${user.id}/${user.avatar}`;
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
			{#each navItems as item}
				<li aria-current={$page.url.pathname === item.path ? 'page' : undefined}>
					<a href={item.path}>{item.name}</a>
				</li>
			{/each}

			{#if $currentUser}
				<li>
					<button on:click={handleLogout} class="nav-button">Logout</button>
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

	<div class="corner user-corner">
		{#if $currentUser}
			<div class="user-info">
				{#if getAvatarUrl($currentUser)}
					<img src={getAvatarUrl($currentUser)} alt="Avatar" class="avatar" />
				{/if}
				<span class="username"
					>{$currentUser.name || $currentUser.username || $currentUser.email || 'User'}</span
				>
			</div>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		position: relative;
		padding: 0.5rem;
	}

	.corner {
		width: 3em;
		height: 3em;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-corner {
		min-width: 15em;
		height: auto;
		justify-content: flex-end;
		padding-right: 0;
		position: relative;
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
		background: none;
		border: none;
		cursor: pointer;
	}

	a:hover,
	.nav-button:hover {
		color: var(--color-theme-1);
	}
</style>
