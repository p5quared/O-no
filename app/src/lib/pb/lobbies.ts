import { TABLES } from './constants';
import { pb } from './pocketbase';

export async function createLobby(name: string) {
	try {
		const newLobby = await pb.collection('lobbies').create({
			name: name,
			host: pb.authStore.record!.id,
			players: []
		});
		return newLobby;
	} catch (error) {
		console.error('Error Creating a Lobby:', error);
		throw error;
	}
}

export async function fetchAllLobbies() {
	try {
		const lobbies = await pb.collection('lobbies').getFullList();
		return lobbies;
	} catch (error) {
		console.error('Error Getting all the Lobbies:', error);
		throw error;
	}
}

export function subscribeToLobbies(callback: Function) {
	pb.collection('lobbies').subscribe('*', (e) => {
		callback(e);
	});
}

export async function joinLobby(lobbyId: string) {
	try {
		const currentUserId = pb.authStore.record!.id;
		
		const existingLobbies = await pb.collection('lobbies').getList(1, 50, {
			filter: `players ~ "${currentUserId}"`
		});
		
		for (const existingLobby of existingLobbies.items) {
			if (existingLobby.id !== lobbyId) {
				const updatedPlayers = existingLobby.players.filter(
					(playerId: string) => playerId !== currentUserId
				);
				await pb.collection('lobbies').update(existingLobby.id, { 
					players: updatedPlayers 
				});
			}
		}
		
		const lobby = await pb.collection('lobbies').getOne(lobbyId);
		const players = lobby.players || [];
		if (!players.includes(currentUserId)) {
			players.push(currentUserId);
			await pb.collection('lobbies').update(lobbyId, { players });
		}
		
		return await pb.collection('lobbies').getOne(lobbyId, { expand: 'players' });
	} catch (error) {
		console.error('Error Joining the Lobby:', error);
		throw error;
	}
}

export async function fetchSingleLobby(lobbyId: string) {
	try {
		const result = await pb.collection('lobbies').getOne(lobbyId, {
			expand: 'players'
		});
		return result;
	} catch (err) {
		console.error('Error fetching lobby:', err);
		throw err;
	}
}

export async function updateLobby(lobbyId: string, data: Record<string, any>) {
	try {
		const result = await pb.collection('lobbies').update(lobbyId, data);
		return result;
	} catch (error) {
		console.error('Error updating lobby:', error);
		throw error;
	}
}

export async function closeLobby(lobbyId: string) {
  try {
	await pb.collection(TABLES.LOBBIES).update(lobbyId, {is_closed: true})
  } catch (error) {
	console.error('Error closing lobby: ', error)
  }
}

export async function playerIsInLobby(lobbyID: string, playerID: string): Promise<boolean> {
  const lobby = await fetchSingleLobby(lobbyID);
  return lobby.players.includes(playerID)
}
