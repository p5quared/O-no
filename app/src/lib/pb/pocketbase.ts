import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types/pocketbase';
import { PUBLIC_VERCEL_PB_URL } from '$env/static/public';

/**
 * Single PocketBase instance for the entire app
 */
const LOCAL_PB_URL =  "https://c.myintro.link/api/pb"; //import.meta.env.VITE_PB_URL;
const PROD_PB_URL = "https://c.myintro.link/api/pb"; //PUBLIC_VERCEL_PB_URL ?? "https://pocketbase-frosty-grass-3189";
export const pb = new PocketBase(LOCAL_PB_URL ?? PROD_PB_URL) as TypedPocketBase;
