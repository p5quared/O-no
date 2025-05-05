import { pb } from './pocketbase';

/**
 * Create or find a playtime entry for the current user and game
 * @param userId The user ID
 * @param lobbyId The game/lobby ID
 */
export async function createPlaytimeEntry(userId: string, lobbyId: string) {
	try {
		// Check if an entry already exists
		const existingEntries = await pb.collection('playtime').getList(1, 1, {
			filter: `user="${userId}" && game="${lobbyId}"`
		});
		
		if (existingEntries.items.length === 0) {
			// Create a new entry if none exists
			await pb.collection('playtime').create({
				user: userId,
				game: lobbyId
				// start field will be auto-populated by the autodate field
			});
			console.log('Created new playtime entry for user', userId, 'in game', lobbyId);
		} else {
			console.log('Playtime entry already exists for user', userId, 'in game', lobbyId);
		}
	} catch (error) {
		console.error('Error creating playtime entry:', error);
	}
}

/**
 * Update the playtime entry when the game ends
 * @param userId The user ID
 * @param lobbyId The game/lobby ID
 */
export async function updatePlaytimeEntry(userId: string, lobbyId: string) {
	try {
		const existingEntries = await pb.collection('playtime').getList(1, 1, {
			filter: `user="${userId}" && game="${lobbyId}"`
		});
		
		if (existingEntries.items.length > 0) {
			const entryId = existingEntries.items[0].id;
			// Just update the record - the end field will be auto-populated by the autodate field
			await pb.collection('playtime').update(entryId, {});
			console.log('Updated playtime entry for user', userId, 'in game', lobbyId);
		}
	} catch (error) {
		console.error('Error updating playtime entry:', error);
	}
}
