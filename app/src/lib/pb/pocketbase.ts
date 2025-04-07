import PocketBase from 'pocketbase';

/**
 * Single PocketBase instance for the entire app
 */
export const pb = new PocketBase('http://localhost:8090');
