import { logAuth } from '$lib/server/logging/logger';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Endpoint for logging authentication attempts from client-side code
 */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, action, success, reason, status } = await request.json();
    
    // Validate required fields
    if (!email || !action) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Determine success state based on status code if provided
    // HTTP status codes in 200 range indicate success, others (like 401) indicate failure
    const isSuccess = status ? (status >= 200 && status < 300) : !!success;
    
    // Log the auth attempt with the correct success state
    logAuth(email, action as 'login' | 'register', isSuccess, reason);
    
    return json({ success: true });
  } catch (error) {
    console.error('Error in logging endpoint:', error);
    return json({ error: 'Server error' }, { status: 500 });
  }
}; 