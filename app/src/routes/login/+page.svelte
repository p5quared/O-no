<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';
	import google from '$lib/images/google.svg';
	// No environment variables needed here for the recommended flow
	let error = '';
	let loading = false;
	let email = '';
	let password = '';

	async function handleLogin() {
		loading = true;
		try {
			await pb.collection('users').authWithPassword(email, password);
			window.location.href = '/';
		} catch (err: any) {
			error = err.message || 'Login failed';
		}
		loading = false;
	}

	async function handleGoogleLogin() {
		loading = true;
		try {
			await pb.collection('users').authWithOAuth2({
				provider: 'google'
			});
			window.location.reload();
		} catch (err: any) {
			error = err.message || 'Google authentication failed';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="mx-auto max-w-md p-4">
	<h1 class="mb-6 text-2xl font-bold">Login</h1>

	{#if error}
		<p class="mb-4 text-red-600">{error}</p>
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
			class="mb-4 flex items-center justify-center gap-2 rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
			disabled={loading}
		>
			{#if loading}Logging in…{:else}Login{/if}
		</button>
	</form>
	<div class="flex flex-col gap-4">
		<button
			on:click={handleGoogleLogin}
			class="flex items-center justify-center gap-2 rounded bg-white px-6 py-3 font-medium text-gray-800 shadow hover:bg-gray-50"
			style="cursor:pointer"
			disabled={loading}
		>
			<img src={google} alt="Google" width="24" height="24" />
			Continue with Google
		</button>
	</div>

	<div class="mt-6 text-center text-sm">
		Don't have an account yet?
		<a href="/registration" class="text-indigo-600 hover:underline">Register here</a>
	</div>
</div>
