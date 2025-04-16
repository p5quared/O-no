import { pb } from './pocketbase';

export interface UserCreateData {
	username: string;
	email: string;
	password: string;
	passwordConfirm: string;
}

export interface UserCreateResult {
	success: boolean;
	error?: string;
	data?: any;
}

/**
 * Creates a new user in PocketBase
 */
export async function createUser(userData: UserCreateData): Promise<UserCreateResult> {
	try {
		const user = await pb.collection('users').create({
			...userData,
			authToken: ''
		});

		return {
			success: true,
			data: user
		};
	} catch (error: any) {
		console.error('User creation failed:', error);

		let errorMessage = '';

		if (error?.response?.data) {
			const errors = error.response.data;

			if (errors?.username) {
				errorMessage += 'Username: ' + errors.username.message + ' ';
			}

			if (errors?.password) {
				errorMessage += 'Password: ' + errors.password.message + ' ';
			}

			if (errors?.email) {
				errorMessage += 'Email: ' + errors.email.message + ' ';
			}
		} else {
			errorMessage = 'Something went wrong, account not created!';
		}

		return {
			success: false,
			error: errorMessage
		};
	}
}

/**
 * Authenticate with Google OAuth
 */
export async function authenticateWithGoogle() {
	try {
		// This will redirect the user to the OAuth provider's sign-in page
		const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
		return {
			success: true,
			data: authData
		};
	} catch (error: any) {
		console.error('Google authentication failed:', error);
		return {
			success: false,
			error: error?.message || 'Google authentication failed'
		};
	}
}

/**
 * Authenticate with GitHub OAuth
 */
export async function authenticateWithGitHub() {
	try {
		// This will redirect the user to the OAuth provider's sign-in page
		const authData = await pb.collection('users').authWithOAuth2({ provider: 'github' });
		return {
			success: true,
			data: authData
		};
	} catch (error: any) {
		console.error('GitHub authentication failed:', error);
		return {
			success: false,
			error: error?.message || 'GitHub authentication failed'
		};
	}
}

/**
 * Check if the user is authenticated
 */
export function isUserAuthenticated() {
	return pb.authStore.isValid;
}

/**
 * Get the current authenticated user
 */
export function getCurrentUser() {
	return pb.authStore.model;
}

/**
 * Logout the current user
 */
export function logout() {
	pb.authStore.clear();
}
