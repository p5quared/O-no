import { logAuth } from '$lib/server/logging/logger';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Endpoint for logging authentication attempts from client-side code
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, action, success, reason } = await request.json();
    
    // Validate required fields
    if (!email || !action) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Log the auth attempt
    logAuth(email, action as 'login' | 'register', success, reason);
    
    return json({ success: true });
  } catch (error) {
    console.error('Error in logging endpoint:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
}; 