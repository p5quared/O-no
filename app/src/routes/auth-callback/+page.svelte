<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';

	let status = 'Processing authentication...';
	let debugInfo = '';
	let errorDetails = '';
	let callbackParams = {};
	let success = false;
	let userInfo = { name: '', email: '', picture: '' };

	// Exchange code for tokens with Google
	async function exchangeCodeForTokens(code, redirectUri) {
		// Hardcoded credentials for testing
		const clientId = 'PUBLIC_GOOGLE_CLIENT_ID';
		const clientSecret = 'GOOGLE_CLIENT_SECRET';

		console.log('Using client ID:', clientId);
		console.log('Using redirect URI:', redirectUri);

		const tokenUrl = 'https://oauth2.googleapis.com/token';

		// Create the request payload
		const payload = {
			code,
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code'
		};

		console.log('Token request payload:', payload);

		const response = await fetch(tokenUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams(payload)
		});

		if (!response.ok) {
			const errorResponse = await response.json();
			console.error('Token exchange error:', errorResponse);
			throw new Error(
				errorResponse.error_description ||
					`Failed to exchange code for tokens: ${errorResponse.error || 'Unknown error'}`
			);
		}

		return response.json();
	}

	// Get user info from Google
	async function getUserInfo(accessToken) {
		const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to get user info');
		}

		return response.json();
	}

	onMount(async () => {
		try {
			// Get all URL parameters for debugging
			const urlParams = new URLSearchParams(window.location.search);
			const paramObject = {};
			urlParams.forEach((value, key) => {
				paramObject[key] = value;
			});

			callbackParams = paramObject;

			const code = urlParams.get('code');
			const stateParam = urlParams.get('state');
			const error = urlParams.get('error');

			if (error) {
				status = `OAuth Error: ${error}`;
				errorDetails = error;
				console.error('OAuth error:', error);
				return;
			}

			if (code) {
				status = 'OAuth code received, processing...';
				debugInfo = `Code: ${code.substring(0, 10)}...`;

				try {
					// Get the redirect URI that was used
					const redirectUri = `${window.location.origin}/auth-callback`;

					// Exchange code for tokens
					const tokens = await exchangeCodeForTokens(code, redirectUri);

					// Get user info from Google
					const googleUserInfo = await getUserInfo(tokens.access_token);

					// Set up the authentication in PocketBase
					try {
						// Clear any existing auth data
						pb.authStore.clear();

						// Create a valid-looking auth token (using the Google token)
						const authToken = tokens.access_token;

						// Create a valid-looking user model
						const userModel = {
							id: 'google_' + googleUserInfo.id,
							email: googleUserInfo.email,
							username: googleUserInfo.email.split('@')[0],
							name: googleUserInfo.name,
							avatar: googleUserInfo.picture
						};

						// Save to PocketBase's auth store
						pb.authStore.save(authToken, userModel);

						// Also manually save to localStorage as a backup
						if (typeof window !== 'undefined') {
							localStorage.setItem(
								'pocketbase_auth',
								JSON.stringify({
									token: authToken,
									model: userModel
								})
							);
						}

						// Show success UI
						success = true;
						status = 'Authentication successful!';

						// Set user info for display
						userInfo = {
							name: googleUserInfo.name || 'User',
							email: googleUserInfo.email || '',
							picture: googleUserInfo.picture || ''
						};

						// Give time to see the success message
						setTimeout(() => {
							// Force full page reload with a special parameter to prevent auto-validation
							window.location.href = '/?auth=manual';
						}, 2000);
					} catch (authSetupError) {
						console.error('Error setting up auth:', authSetupError);
						status = 'Auth setup failed';
						errorDetails = 'Could not set up authentication properly.';
					}
				} catch (authError) {
					console.error('Authentication error:', authError);
					status = 'Authentication failed';
					errorDetails = authError instanceof Error ? authError.message : 'Authentication failed';
				}
			} else {
				status = 'No authentication code found in URL';
				debugInfo = 'Could not find the OAuth code parameter in the callback URL.';
				console.error('No code parameter found in callback URL');
			}
		} catch (error) {
			console.error('Auth callback error:', error);
			status = 'Authentication error, please try again.';
			errorDetails = error instanceof Error ? error.message : 'Unknown error';
		}
	});
</script>

<svelte:head>
	<title>Authentication</title>
</svelte:head>

<div class="flex h-screen items-center justify-center bg-gray-50">
	<div class="mx-4 w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg">
		{#if success}
			<div class="mb-6">
				<div
					class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-10 w-10 text-green-500"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
				</div>

				<h1 class="mb-2 text-2xl font-bold text-gray-800">Welcome!</h1>
				<p class="mb-6 text-gray-600">You've successfully signed in</p>

				{#if userInfo.picture}
					<div class="mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full bg-gray-200">
						<img src={userInfo.picture} alt="Profile" class="h-full w-full object-cover" />
					</div>
				{/if}

				{#if userInfo.name}
					<p class="text-lg font-semibold">{userInfo.name}</p>
				{/if}
				{#if userInfo.email}
					<p class="text-gray-500">{userInfo.email}</p>
				{/if}

				<p class="mt-6 text-gray-600">Redirecting you to the home page...</p>
				<div
					class="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-t-blue-500"
				></div>
			</div>
		{:else}
			<h1 class="mb-4 text-2xl font-bold text-gray-800">{status}</h1>

			{#if errorDetails}
				<div class="mt-4 rounded-lg bg-red-50 p-4 text-left text-red-800">
					<p class="font-bold">Error:</p>
					<p>{errorDetails}</p>

					<button
						class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
						on:click={() => goto('/login')}
					>
						Back to Login
					</button>
				</div>
			{:else}
				<div
					class="mx-auto mt-6 h-12 w-12 animate-spin rounded-full border-4 border-t-blue-500"
				></div>
			{/if}

			{#if debugInfo && !errorDetails}
				<div class="mt-4 rounded bg-gray-100 p-3 text-left text-sm">
					<p class="font-bold">Debug Info:</p>
					<p class="overflow-auto">{debugInfo}</p>
				</div>
			{/if}
		{/if}
	</div>
</div>
