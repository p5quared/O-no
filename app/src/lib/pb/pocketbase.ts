import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types/pocketbase';

/**
 * Single PocketBase instance for the entire app
 */
export const pb = new PocketBase('http://localhost:8090') as TypedPocketBase;
