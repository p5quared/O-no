import type { PlayerPosition } from '$lib/events/Events';
import { TABLES } from './constants';
import { pb } from './pocketbase';
import type { PlayerPositionsRecord } from './types/pocketbase';

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

export function getLoggedInUserID(): string {
	return pb.authStore.record?.id ?? '';
}

export async function listUserPositions() {
	return await pb.collection(TABLES.PLAYER_POSITIONS).getFullList();
}

// Creates a new user position record,
// and possible deletes the old one.
export async function createOrRecreateUserPositionRecord(userID: string, x: number, y: number): Promise<string> {
	try {
		await deleteUserPositionRecordByUserId(userID);
	} catch (error) {
		console.error('Error creating or recreating user position record:', error);
	}


	const { id } = await pb.collection(TABLES.PLAYER_POSITIONS).create({
		user: userID,
		x: x,
		y: y
	})

	return id;
}

export async function updateUserPositionRecord(id: string, p: PlayerPosition) {
   await pb.collection(TABLES.PLAYER_POSITIONS).update(id, p).catch(e=> {})
}

export async function deleteUserPositionRecordByUserId(userID: string) {
  try {
  		const { id } = await pb.collection(TABLES.PLAYER_POSITIONS).getFirstListItem<PlayerPositionsRecord>(`user="${userID}"`);
  		if (id) {
  			await pb.collection(TABLES.PLAYER_POSITIONS).delete(id);
  		}
  	} catch (error) {
  		console.error('Error deleting user position record:', error);
  	}
  }

export async function deleteUserPositionRecord(id: string) {
  try {
  await pb.collection(TABLES.PLAYER_POSITIONS).delete(id);
  } catch (error) {
	console.error('Error deleting user position record:', error);
  }
}
