import PocketBase from 'pocketbase';

// Create a single PocketBase instance for the entire app
export const pb = new PocketBase('http://localhost:8090');
