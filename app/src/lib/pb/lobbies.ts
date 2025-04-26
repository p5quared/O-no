import { pb } from './pocketbase'; 

export async function createLobby(name: string) {
    try {
        const newLobby = await pb.collection('lobbies').create({
            name: name,
            host: pb.authStore.record!.id,
            players: [],
            gameStarted: false
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

export async function subscribeToLobby(lobbyId: string, callback: Function) {
    const unsubscribe = await pb.collection('lobbies').subscribe(lobbyId, async (e) => {
      const updatedLobby = await pb.collection('lobbies').getOne(lobbyId, {
        expand: 'host,players'
      });
      callback(updatedLobby);
    });
    return unsubscribe;
  }
  



export async function joinLobby(lobbyId: string) {
    try {
        const lobby = await pb.collection('lobbies').getOne(lobbyId);
        const players = lobby.players || [];
        //console.log('Before join:', players); 
        //console.log("players data:", players)
        //console.log("lobby data:", lobby)
        if (players.length >= 10) {
			throw new Error("Lobby is full");
		}

        if (!players.includes(pb.authStore.record!.id)) {
            players.push(pb.authStore.record!.id);
            await pb.collection('lobbies').update(lobbyId, { players });
            //console.log('After join:', players); 
        }
        
    } catch (error) {
      console.error('Error Joining the Lobby:', error);
      throw error;
    }
}
  

export async function fetchSingleLobby(lobbyId: string) {
	try {
		const result = await pb.collection('lobbies').getOne(lobbyId, {
			expand: 'host,players',
		});
		return result;
	} catch (err) {
		console.error('Error fetching lobby:', err);
		throw err;
	}
}



export async function leaveLobby(lobbyId: string) {
    try {
      const lobby = await pb.collection('lobbies').getOne(lobbyId);
      const players = lobby.players || [];
  
      const userId = pb.authStore.record?.id;
      if (!userId) return;
  
      const updatedPlayers = players.filter((id: string) => id !== userId);
  
      await pb.collection('lobbies').update(lobbyId, { players: updatedPlayers });
    } catch (error) {
      console.error('Error leaving the lobby:', error);
    }
}
  