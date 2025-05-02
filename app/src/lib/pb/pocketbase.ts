import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types/pocketbase';
import { PUBLIC_VERCEL_PB_URL } from '$env/static/public';

/**
 * Single PocketBase instance for the entire app
 */
const LOCAL_PB_URL = import.meta.env.VITE_PB_URL;
const PROD_PB_URL = PUBLIC_VERCEL_PB_URL ?? 'https://pocketbase-frosty-grass-3189';
export const pb = new PocketBase(LOCAL_PB_URL ?? PROD_PB_URL) as TypedPocketBase;
