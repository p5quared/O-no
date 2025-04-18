<script lang="ts">
	import Counter from './Counter.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcomeFallback from '$lib/images/svelte-welcome.png';
	import { logoutUser } from '$lib/pb/auth';

	import { pb } from '$lib/pb/pocketbase'; //hello I added this to test login
	let username: string | null = null;

	if (pb.authStore.isValid && pb.authStore.record) {
		username = pb.authStore.record.username;
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>
		<span class="welcome">
			<picture>
				<source srcset={welcome} type="image/webp" />
				<img src={welcomeFallback} alt="Welcome" />
			</picture>
		</span>

		to your new<br />SvelteKit app
		{#if username}
			<p class="mt-4 text-center text-lg font-semibold">Welcome {username}!</p>
			<button
				on:click={logoutUser}
				class="rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
				style="cursor: pointer;"
			>
				Logout
			</button>
		{:else}
			<p class="mt-4 text-center text-lg text-gray-500">User not Logged in!</p>
		{/if}
	</h1>

	<h2>
		try editing <strong>src/routes/+page.svelte</strong>
	</h2>

	<Counter />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
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
</style>
