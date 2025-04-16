<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { pb } from '$lib/pb/pocketbase';

	let status = 'Processing authentication...';
	let errorDetails = '';
	let success = false;
	let userInfo = { name: '', email: '', picture: '' };

	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const code = urlParams.get('code');
		const state = urlParams.get('state');
		const errorParam = urlParams.get('error');

		if (errorParam) {
			status = 'OAuth Error from Google';
			errorDetails = `Google returned an error: ${errorParam}`;
			console.error('OAuth error from provider:', errorParam);
			return;
		}

		if (!code || !state) {
			status = 'Invalid callback parameters';
			errorDetails = 'Missing authorization code or state from Google.';
			console.error('Missing code or state in callback URL');
			return;
		}

		status = 'Authenticating with PocketBase...';

		try {
			const redirectUrl = `${window.location.origin}/auth-callback`;

			const authData = await pb
				.collection('users')
				.authWithOAuth2Code('google', code, state, redirectUrl);

			console.log('PocketBase auth successful:', authData);

			success = true;
			status = 'Authentication successful!';

			if (pb.authStore.model) {
				const model = pb.authStore.model;
				const avatarUrl = model.avatar
					? `${pb.baseUrl}/api/files/${model.collectionId || model.collectionName}/${model.id}/${model.avatar}`
					: '';

				userInfo = {
					name: model.name || model.username || 'User',
					email: model.email || '',
					picture: avatarUrl
				};
			}

			// Use SvelteKit's goto for client-side navigation
			console.log('Navigating to home page using goto...');
			setTimeout(() => {
				goto('/', { replaceState: true });
			}, 1000); // Keep a small delay for user feedback
		} catch (err) {
			console.error('PocketBase OAuth Error:', err);
			status = 'Authentication failed';
			errorDetails =
				err?.message ||
				'Failed to authenticate with PocketBase. Check PocketBase server logs and configuration.';
			if (err?.data) {
				console.error('PocketBase Error Data:', err.data);
				errorDetails += ` Details: ${JSON.stringify(err.data)}`;
			}
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
		{/if}
	</div>
</div>
