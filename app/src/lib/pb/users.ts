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

			

			if (errors?.password) {
				errorMessage += 'Password: ' + errors.password.message + ' ';
			}

			if (errors?.email) {
				errorMessage += 'Email: ' + errors.email.message + ' ';
			}

			if (errors?.name) {
				errorMessage += 'Name: ' + errors.name.message + ' ';
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
