<script lang="ts">
	import { loginUser } from '$lib/pb/auth';
	import { goto } from '$app/navigation';
	
	
	let email = '';
	let password = '';
	let error = '';
	let loading = false;

	async function handleLogin() {
		loading = true;
		error = '';

		const result = await loginUser(email, password);

		if (result.success) {
			goto('/'); 
		} else {
			error = result.error || 'Login failed';
		}

		loading = false;
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="mx-auto max-w-md p-4">
	<h1 class="mb-4 text-2xl font-bold">Login</h1>

	{#if error}
		<p class="text-red-600">{error}</p>
	{/if}

	<form on:submit|preventDefault={handleLogin} class="flex flex-col gap-4">
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			class="flex-1 rounded border border-gray-300 p-3"
		/>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			required
			class="flex-1 rounded border border-gray-300 p-3"
		/>

		<button
			type="submit"
			class="rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
			style="cursor:pointer"
			disabled={loading}
		>
			{loading ? 'Logging in...' : 'Login'}
		</button>
	</form>
</div>
