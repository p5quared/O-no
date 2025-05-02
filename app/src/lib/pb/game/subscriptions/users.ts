import type { PlayerPosition } from '$lib/events/Events';
import { TABLES } from '$lib/pb/constants';
import { pb } from '$lib/pb/pocketbase';
import type { PlayerPositionsRecord } from '$lib/pb/types/pocketbase';

export async function listUserPositions() {
	return await pb.collection(TABLES.PLAYER_POSITIONS).getFullList();
}

// Creates a new user position record,
// and possible deletes the old one.
export async function createOrRecreateUserPositionRecord(
	userID: string,
	x: number,
	y: number
): Promise<string> {
	try {
		deleteUserPositionRecordByUserId(userID)
			.then()
			.catch((e) => {});
	} catch (error) {
		console.error('Error creating or recreating user position record:', error);
	}

	const { id } = await pb.collection(TABLES.PLAYER_POSITIONS).create({
		user: userID,
		x: x,
		y: y
	});

	return id;
}

export async function updateUserPositionRecord(id: string, p: PlayerPosition) {
	await pb
		.collection(TABLES.PLAYER_POSITIONS)
		.update(id, p)
		.catch((e) => {});
}

export async function deleteUserPositionRecordByUserId(userID: string) {
	const { id } = await pb
		.collection(TABLES.PLAYER_POSITIONS)
		.getFirstListItem<PlayerPositionsRecord>(`user="${userID}"`);
	if (id) {
		pb.collection(TABLES.PLAYER_POSITIONS).delete(id).catch();
	}
}

export async function deleteUserPositionRecord(id: string) {
	try {
		await pb.collection(TABLES.PLAYER_POSITIONS).delete(id);
	} catch (error) {
		console.error('Error deleting user position record:', error);
	}
}
