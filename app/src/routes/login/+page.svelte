<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';
	import google from '$lib/images/google.svg';
	import heavenBackground from '$lib/images/heaven.png';

	// No environment variables needed here for the recommended flow
	let error = '';
	let loading = false;
	let email = '';
	let password = '';

	// Helper function to log auth attempts via server endpoint
	async function logAuthAttempt(email: string, action: string, success: boolean, reason?: string) {
		try {
			await fetch('/api/log', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, action, success, reason, status: 401 })
			});
		} catch (e) {
			console.error('Failed to log auth attempt:', e);
		}
	}

	async function handleLogin() {
		loading = true;
		try {
			// Attempt to log in with PocketBase
			await pb.collection('users').authWithPassword(email, password);
			goto('/');
		} catch (err: any) {
			// Log the failed login attempt via server endpoint in background
			logAuthAttempt(email, 'login', false, err.message || 'Login failed');
			
			// Show error to user
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
			goto('/');
		} catch (err: any) {
			// Log failed Google auth via server endpoint in background
			logAuthAttempt(email || 'google-auth', 'login', false, err.message || 'Google authentication failed');
			error = err.message || 'Google authentication failed';
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="register-bg" style="background-image: url({heavenBackground});">
	<div class="form-box mx-auto max-w-md p-4">
		<div class="mx-auto max-w-md p-4">
			<h1
				class="mb-6 text-2xl font-bold"
				style="color: #9cc362; font-family: 'FrogFont', sans-serif;"
			>
				Hop On In!
			</h1>

			{#if error}
				<p style="color: #e55e15">{error}</p>
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
					style="cursor:pointer; background-color: #9cc362; font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;"
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
				<a
					href="/registration"
					class=" hover:underline"
					style="color: #9cc362; font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;"
					>Register here</a
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
		background: rgb(54, 145, 114);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
	}
</style>
