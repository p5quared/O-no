import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { errorWrapper } from '$lib/server/logging/logger';

/**
 * This endpoint intentionally throws an error to test error logging with stack traces
 */
export const GET: RequestHandler = async () => {
  return errorWrapper(async () => {
    // Intentionally cause an error for testing
    const obj = null;
    obj.nonExistentMethod(); // This will throw a TypeError
    
    return json({ success: true });
  });
}; 