export const ssr = false;
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
