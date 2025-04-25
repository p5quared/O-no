import { pb } from './pocketbase'; 

export async function createLobby(name: string) {
    try {
        const newLobby = await pb.collection('lobbies').create({
            name: name,
            host: pb.authStore.record!.id,
            players: [],
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
      const lobby = await pb.collection('lobbies').getOne(lobbyId);
      const players = lobby.players || [];
      if (!players.includes(pb.authStore.record!.id)) {
        players.push(pb.authStore.record!.id);
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
			expand: 'players',
		});
		return result;
	} catch (err) {
		console.error('Error fetching lobby:', err);
		throw err;
	}
}
