<script lang="ts">
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';

	let error = '';
	let loading = false;

	function handleGoogleLogin() {
		console.log('Google login button clicked');
		loading = true;
		error = '';

		try {
			// Directly construct Google OAuth URL with hardcoded ID for testing
			const googleClientId = 'PUBLIC_GOOGLE_CLIENT_ID';

			// Get the current origin for the redirect URI
			const redirectUri = encodeURIComponent(`${window.location.origin}/auth-callback`);
			const scope = encodeURIComponent('email profile openid');
			const state = encodeURIComponent(JSON.stringify({ provider: 'google' }));

			const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;

			console.log('Redirecting to:', googleAuthUrl);
			window.location.href = googleAuthUrl;
		} catch (err: any) {
			console.error('Google OAuth error:', err);
			error = err.message || 'Google authentication failed';
			loading = false;
		}
	}

	function handleGitHubLogin() {
		loading = true;
		error = '';

		try {
			// We'll implement GitHub later if Google works
			error = 'GitHub login not implemented yet';
			loading = false;
		} catch (err: any) {
			error = err.message || 'GitHub authentication failed';
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

	<div class="flex flex-col gap-4">
		<button
			on:click={handleGoogleLogin}
			class="flex items-center justify-center gap-2 rounded bg-white px-6 py-3 font-medium text-gray-800 shadow hover:bg-gray-50"
			style="cursor:pointer"
			disabled={loading}
		>
			<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
				<g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
					<path
						fill="#4285F4"
						d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
					/>
					<path
						fill="#34A853"
						d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
					/>
					<path
						fill="#FBBC05"
						d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
					/>
					<path
						fill="#EA4335"
						d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
					/>
				</g>
			</svg>
			Continue with Google
		</button>

		<button
			on:click={handleGitHubLogin}
			class="flex items-center justify-center gap-2 rounded bg-gray-800 px-6 py-3 font-medium text-white hover:bg-gray-700"
			style="cursor:pointer"
			disabled={loading}
		>
			<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
				<path
					fill="white"
					d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
				/>
			</svg>
			Continue with GitHub
		</button>
	</div>

	<div class="mt-6 text-center text-sm">
		Don't have an account yet?
		<a href="/registration" class="text-indigo-600 hover:underline">Register here</a>
	</div>
</div>
