import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types/pocketbase';

/**
 * Single PocketBase instance for the entire app
 */
const LOCAL_PB_URL = import.meta.env.VITE_PB_URL;
const PROD_PB_URL = "https://pocketbase-twilight-surf-4702.fly.dev";
export const pb = new PocketBase(LOCAL_PB_URL ?? PROD_PB_URL) as TypedPocketBase;
