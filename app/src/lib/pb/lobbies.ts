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
            players: [pb.authStore.model.id],
        });
        return newLobby;
    } catch (error) {
        console.error('Error creating lobby:', error);
        throw error;
    }
}


export function subscribeToLobbies(callback: Function) {
    // This subscribes to changes in the lobbies collection and calls the callback when there's an update
    pb.collection('lobbies').subscribe('*', (e) => {
        callback(e); // Pass the event (could be created, updated, or deleted)
    });
}









