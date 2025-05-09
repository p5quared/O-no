<script lang="ts">
	import { createUser } from '$lib/pb/users';
	import { goto } from '$app/navigation';
	import hellBackground from '$lib/images/froghell.png';

	let name = '';
	let email = '';
	let password = '';
	let passwordConfirm = '';
	let error = '';
	let loading = false;
	let successMessage = '';

	// Helper function to log auth attempts via server endpoint
	async function logAuthAttempt(email: string, action: string, success: boolean, reason?: string) {
		try {
			await fetch('/api/log', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, action, success, reason })
			});
		} catch (e) {
			console.error('Failed to log auth attempt:', e);
		}
	}

	async function handleSubmit() {
		loading = true;
		error = '';

		if (password !== passwordConfirm) {
			error = 'Passwords do not match!';
			// Log validation failure
			await logAuthAttempt(email, 'register', false, 'Passwords do not match');
			loading = false;
			return false;
		}

		const result = await createUser({
			name,
			email,
			password,
			passwordConfirm
		});

		if (result.success) {
			// Log successful registration
			await logAuthAttempt(email, 'register', true);
			successMessage = 'Account created!';
			setTimeout(() => goto('/login'), 1500);
		} else {
			// Log failed registration
			
			error = result.error || 'Registration failed';
			await logAuthAttempt(email, 'register', false, result.error || 'Registration failed');
		}

		loading = false;
		return false;
	}
</script>

<svelte:head>
	<title>Registration</title>
</svelte:head>

<div class="register-bg" style="background-image: url({hellBackground});">
	<div class="form-box mx-auto max-w-md p-4">
		<div class="mx-auto max-w-md p-4">
			<h1
				class="mb-4 text-2xl font-bold"
				style="color: #e55e15; font-family: 'FrogFont', sans-serif;"
			>
				Join the Colony!
			</h1>

			{#if error}
				<p style="color: #e55e15">{error}</p>
			{/if}
			{#if successMessage}
				<p style="color: #9cc362;">{successMessage}</p>
			{/if}
			<form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-4">
				<input
					type="text"
					bind:value={name}
					placeholder="Name"
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
					class="rounded px-6 py-3 font-bold text-white"
					style="cursor:pointer; background-color: #e55e15; font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;"
					disabled={loading}
				>
					{loading ? 'Registering...' : 'Register'}
				</button>
			</form>

			<div
				class="mt-6 text-center text-sm text-white"
				style="font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;"
			>
				Already Registered a Frog?
				<a href="/login" class="hover:underline" style="cursor:pointer; color: #e55e15;"
					>Login here</a
				>
			</div>
		</div>
	</div>
</div>

<style>
	.register-bg {
		min-height: 100vh;
		background-size: cover;
		background-position: center;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.form-box {
		background: rgb(60, 25, 18);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}
</style>
