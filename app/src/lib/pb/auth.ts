import { pb } from './pocketbase';

export interface LoginResult {
	success: boolean;
	error?: string;
	data?: any;
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
	try {
		const authData = await pb.collection('users').authWithPassword(email, password);

		return {
			success: true,
			data: authData
		};
	} catch (error: any) {
		console.error('Login failed:', error);

		let errorMessage = 'Invalid email or password';
		if (error?.response?.message) {
			errorMessage = error.response.message;
		}

		return {
			success: false,
			error: errorMessage
		};
	}
}

export function logoutUser() {
	pb.authStore.clear();
}
