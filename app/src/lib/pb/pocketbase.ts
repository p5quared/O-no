import PocketBase from 'pocketbase';
import type { TypedPocketBase } from './types';

const DEV_URL = 'http://localhost:8090';
const PROD_URL = 'https://ono.myintro.link';
const isProd = import.meta.env.PROD;

let url = isProd ? PROD_URL : DEV_URL;

if (!isProd) {
  try {
    const res = await fetch(DEV_URL + '/api/health', { method: 'GET' });
    if (!res.ok) {
      url = PROD_URL;
    }
  } catch (err) {
    url = PROD_URL;
  }
}

export const pb = new PocketBase(url) as TypedPocketBase;

