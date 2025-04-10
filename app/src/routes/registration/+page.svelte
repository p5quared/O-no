<script lang="ts">
	import { createUser } from '$lib/pb/users';
	import { goto } from '$app/navigation';
	
	let username = '';
	let email = '';
	let password = '';
	let passwordConfirm = '';
	let error = '';
	let loading = false;
	let successMessage = '';

	async function handleSubmit() {
		loading = true;
		error = '';

		if (password !== passwordConfirm) {
			error = 'Passwords do not match!';
			loading = false;
			return false;
		}

		const result = await createUser({
			username,
			email,
			password,
			passwordConfirm
		});

		if (result.success) {
		  
		successMessage = 'Account created!';
		setTimeout(() => goto('/login'), 1500);
		} else {
			error = result.error || 'Registration failed';
		}
		
		loading = false;
		return false;
	}
</script>

<svelte:head>
	<title>Registration</title>
</svelte:head>

<div class="mx-auto max-w-md p-4">
	<h1 class="mb-4 text-2xl font-bold">Registration</h1>
	{#if error}
		<p class="text-red-600">{error}</p>
	{/if}
  {#if successMessage}
	<p class="text-green-600">{successMessage}</p>
  {/if}
	<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
		<input
			type="text"
			bind:value={username}

			placeholder="Username"
			required
			autocomplete="off"
			class="flex-1 rounded border border-gray-300 p-3"
		/>
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<input
			type="password"
			bind:value={password}
			placeholder="Password"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<input
			type="password"
			bind:value={passwordConfirm}
			placeholder="Confirm Password"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<button
			type="submit"
			class="rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
			style="cursor:pointer"
			disabled={loading}
		>
			{loading ? 'Registering...' : 'Register'}
		</button>
	</form>
</div>
