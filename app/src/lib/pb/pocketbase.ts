import PocketBase, { type AuthModel } from 'pocketbase';
import { writable } from 'svelte/store';

// Get the PocketBase URL from environment variables or use the default localhost
const pocketbaseUrl =
	typeof window !== 'undefined'
		? import.meta.env.PUBLIC_POCKETBASE_URL || 'http://localhost:8090'
		: 'http://localhost:8090';

console.log('Initializing PocketBase with URL:', pocketbaseUrl);

/**
 * Single PocketBase instance for the entire app
 */
export const pb = new PocketBase(pocketbaseUrl);

// Disable auto-cancellation
pb.autoCancellation(false);

/**
 * Svelte store to hold the current authenticated user model.
 * Initialize with the current state from pb.authStore.
 */
export const currentUser = writable<AuthModel | null>(pb.authStore.model);

// Important: Prevent PocketBase from auto-validating the token
// This will keep our manually set token valid regardless of server validation
if (typeof window !== 'undefined') {
	const originalIsValid = pb.authStore.isValid;

	// Override the isValid getter to always return true if we have a token
	Object.defineProperty(pb.authStore, 'isValid', {
		get: function () {
			// If we have a token, consider the user authenticated regardless of token validity
			if (this.token) {
				return true;
			}
			// Otherwise use original logic (but don't call it since it's a property)
			return originalIsValid;
		}
	});
}

// Update the currentUser store whenever the auth state changes
pb.authStore.onChange((token, model) => {
	console.log('Auth state changed, updating store. New model:', model);
	currentUser.set(model);
});

// Debug log current auth state on load
if (typeof window !== 'undefined') {
	console.log('Initial auth state on page load:');
	console.log('Auth valid:', pb.authStore.isValid);
	console.log('Auth token:', pb.authStore.token ? 'Token exists' : 'No token');
	console.log('Auth model:', pb.authStore.model);
}
