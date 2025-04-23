import { pb } from './pocketbase'; 

export async function fetchLobbies() {
    try {
        const lobbies = await pb.collection('lobbies').getFullList();
        return lobbies;
    } catch (error) {
        console.error('Error fetching lobbies:', error);
        throw error;
    }
}


export async function createLobby(name: string) {
    try {
        const newLobby = await pb.collection('lobbies').create({
            name: name,
            host: pb.authStore.model.id,
            players: [],
        });
        return newLobby;
    } catch (error) {
        console.error('Error creating lobby:', error);
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

        // Prevent duplicate joins
        if (!players.includes(pb.authStore.model.id)) {
            players.push(pb.authStore.model.id);

            await pb.collection('lobbies').update(lobbyId, {
                players: players
            });
        }

        return lobby;
    } catch (error) {
        console.error('Error joining lobby:', error);
        throw error;
    }
}





