import { TABLES } from './constants';
import { pb } from './pocketbase';
import type { UsersRecord } from './types/pocketbase';

export interface UserCreateData {
	name: string;
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

export async function getUserById(id: string): Promise<UsersRecord> {
	return await pb
		.collection(TABLES.USERS)
		.getOne<UsersRecord>(id)
		.then((record) => record)
		.catch((error) => {
			console.error(`Error fetching user ${id}`, error);
			return {} as UsersRecord;
		});
}

export const getLoggedInUserID = () => {
	return pb.authStore.record?.id || ''; // They better be logged in
};

export async function getUsername(id: string): Promise<string> {
	const user = await getUserById(id);
	return user.name ?? 'Unknown';
}

/**
 * Get the user's score (wins)
 * @param userId The user ID
 * @returns The user's score or 0 if not found
 */
export async function getUserScore(userId: string): Promise<number> {
	try {
		const user = await getUserById(userId);
		return user.score || 0;
	} catch (error) {
		console.error('Error fetching user score:', error);
		return 0;
	}
}
