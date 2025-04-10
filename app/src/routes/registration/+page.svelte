<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<svelte:head>
	<title>Registration</title>
</svelte:head>

<div class="mx-auto max-w-md p-4">
	<h1 class="mb-4 text-2xl font-bold">Registration</h1>
	{#if form?.error}
		<p class="text-red-600">{form.error}</p>
	{/if}
	<form method="POST" use:enhance class="flex flex-col gap-4">
		<input
			type="text"
			name="username"
			value={form?.username ?? ''}
			placeholder="Username"
			required
			autocomplete="off"
			class="flex-1 rounded border border-gray-300 p-3"
		/>
		<input
			type="email"
			name="email"
			value={form?.email ?? ''}
			placeholder="Email"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<input
			type="password"
			name="password"
			placeholder="Password"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<input
			type="password"
			name="passwordConfirm"
			placeholder="Confirm Password"
			required
			autocomplete="off"
			class="rounded border border-gray-300 p-3"
		/>
		<button
			type="submit"
			class="rounded bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
			style="cursor:pointer">Register</button
		>
	</form>
</div>
